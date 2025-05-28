use std::any::Any;
use std::future::Future;
use std::marker::PhantomData;
use std::pin::Pin;
use std::sync::Arc;

type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send>>;

// === Core Monads ===

pub struct SyncMonad<T> {
    value: T,
}

impl<T> SyncMonad<T> {
    pub fn new(value: T) -> Self {
        SyncMonad { value }
    }

    pub fn map<F, U>(self, f: F) -> SyncMonad<U>
    where
        F: FnOnce(T) -> U,
    {
        SyncMonad::new(f(self.value))
    }

    pub fn tap<F>(self, f: F) -> Self
    where
        F: FnOnce(&T),
    {
        f(&self.value);
        self
    }

    pub fn chain<F, U>(self, f: F) -> SyncMonad<U>
    where
        F: FnOnce(T) -> SyncMonad<U>,
    {
        f(self.value)
    }

    pub fn to<F, U>(self, f: F) -> U
    where
        F: FnOnce(T) -> U,
    {
        f(self.value)
    }

    pub fn val(self) -> T {
        self.value
    }
}

pub fn of<T>(value: T) -> SyncMonad<T> {
    SyncMonad::new(value)
}

pub struct AsyncMonad<T: Send + 'static> {
    future: BoxFuture<T>,
}

impl<T: Send + 'static> AsyncMonad<T> {
    pub fn new<F>(future: F) -> Self
    where
        F: Future<Output = T> + Send + 'static,
    {
        AsyncMonad {
            future: Box::pin(future),
        }
    }

    pub fn from_value(value: T) -> Self {
        AsyncMonad {
            future: Box::pin(async move { value }),
        }
    }

    pub fn map<F, U>(self, f: F) -> AsyncMonad<U>
    where
        F: FnOnce(T) -> U + Send + 'static,
        U: Send + 'static,
    {
        AsyncMonad::new(async move {
            let value = self.future.await;
            f(value)
        })
    }

    pub fn tap<F>(self, f: F) -> Self
    where
        F: FnOnce(&T) + Send + 'static,
        T: Sync,
    {
        AsyncMonad::new(async move {
            let value = self.future.await;
            f(&value);
            value
        })
    }

    pub fn chain<F, U>(self, f: F) -> AsyncMonad<U>
    where
        F: FnOnce(T) -> AsyncMonad<U> + Send + 'static,
        U: Send + 'static,
    {
        AsyncMonad::new(async move {
            let value = self.future.await;
            f(value).val().await
        })
    }

    pub fn to<F, U>(self, f: F) -> impl Future<Output = U> + Send
    where
        F: FnOnce(T) -> U + Send + 'static,
        U: Send + 'static,
    {
        async move {
            let value = self.future.await;
            f(value)
        }
    }

    pub async fn val(self) -> T {
        self.future.await
    }
}

pub fn pof_fn<T: Send + 'static>(value: T) -> AsyncMonad<T> {
    AsyncMonad::from_value(value)
}

pub fn pof_fut<F, T>(future: F) -> AsyncMonad<T>
where
    F: Future<Output = T> + Send + 'static,
    T: Send + 'static,
{
    AsyncMonad::new(future)
}

#[macro_export]
macro_rules! pof {
    (async $($rest:tt)*) => {
        $crate::monade::pof_fut(async $($rest)*)
    };
    ($value:expr) => {
        $crate::monade::pof_fn($value)
    };
}

pub struct SyncFnPipeline<T: 'static> {
    steps: Vec<Box<dyn Fn(Box<dyn Any>) -> Box<dyn Any>>>,
    _phantom: PhantomData<T>,
}

impl<T: 'static> SyncFnPipeline<T> {
    pub fn new() -> Self {
        Self {
            steps: Vec::new(),
            _phantom: PhantomData,
        }
    }

    pub fn map<F, U: 'static>(mut self, f: F) -> SyncFnPipeline<U>
    where
        F: Fn(T) -> U + Send + Sync + 'static,
    {
        self.steps.push(Box::new(move |x| {
            let val = *x.downcast::<T>().unwrap();
            Box::new(f(val)) as Box<dyn Any>
        }));
        SyncFnPipeline {
            steps: self.steps,
            _phantom: PhantomData,
        }
    }

    pub fn tap<F>(mut self, f: F) -> Self
    where
        F: Fn(&T) + Send + Sync + 'static,
    {
        self.steps.push(Box::new(move |x| {
            let val = *x.downcast::<T>().unwrap();
            f(&val);
            Box::new(val) as Box<dyn Any>
        }));
        self
    }

    pub fn into_fn(self) -> impl Fn(T) -> SyncMonad<T> + Clone {
        let steps = Arc::new(self.steps);
        move |input: T| {
            let mut val: Box<dyn Any> = Box::new(input);
            for step in steps.iter() {
                val = step(val);
            }
            of(*val.downcast::<T>().unwrap())
        }
    }
}

pub fn ka<T: 'static>() -> SyncFnPipeline<T> {
    SyncFnPipeline::new()
}

pub struct AsyncFnPipeline<T: Send + 'static> {
    steps: Arc<Vec<Arc<dyn Fn(Box<dyn Any + Send>) -> BoxFuture<Box<dyn Any + Send>> + Send + Sync>>>,
    _phantom: PhantomData<T>,
}

impl<T: Send + 'static> AsyncFnPipeline<T> {
    pub fn new() -> Self {
        Self {
            steps: Arc::new(Vec::new()),
            _phantom: PhantomData,
        }
    }

    pub fn map<F, U: Send + 'static>(self, f: F) -> AsyncFnPipeline<U>
    where
        F: Fn(T) -> U + Send + Sync + 'static,
    {
        let mut steps = (*self.steps).clone();
        let f = Arc::new(f);
        steps.push(Arc::new(move |x| {
            let f = f.clone();
            Box::pin(async move {
                let val = *x.downcast::<T>().unwrap();
                let res = f(val);
                Box::new(res) as Box<dyn Any + Send>
            })
        }));
        AsyncFnPipeline {
            steps: Arc::new(steps),
            _phantom: PhantomData,
        }
    }

    pub fn tap<F>(self, f: F) -> Self
    where
        F: Fn(&T) + Send + Sync + 'static,
    {
        let mut steps = (*self.steps).clone();
        let f = Arc::new(f);
        steps.push(Arc::new(move |x| {
            let f = f.clone();
            Box::pin(async move {
                let val = *x.downcast::<T>().unwrap();
                f(&val);
                Box::new(val) as Box<dyn Any + Send>
            })
        }));
        Self {
            steps: Arc::new(steps),
            _phantom: PhantomData,
        }
    }

    pub fn into_fn(self) -> impl Fn(T) -> AsyncMonad<T> + Clone {
        let steps = self.steps.clone();
        move |input: T| {
            let steps = steps.clone();
            let fut = async move {
                let mut val: Box<dyn Any + Send> = Box::new(input);
                for step in steps.iter() {
                    val = step(val).await;
                }
                *val.downcast::<T>().unwrap()
            };
            AsyncMonad::new(fut)
        }
    }
}

pub fn aka<T: Send + 'static>() -> AsyncFnPipeline<T> {
    AsyncFnPipeline::new()
}

// === Devices ===

pub struct Device<T, M> {
    value: T,
    methods: M,
    is_device: bool,
}

impl<T, M: Clone> Device<T, M> {
    pub fn new(methods: M, value: T) -> Self {
        Device {
            value,
            methods,
            is_device: true,
        }
    }

    pub fn map<F, U>(self, f: F) -> Device<U, M>
    where
        F: FnOnce(T) -> U,
    {
        Device::new(self.methods, f(self.value))
    }

    pub fn tap<F>(self, f: F) -> Self
    where
        F: FnOnce(&T),
    {
        f(&self.value);
        self
    }

    pub fn chain<F, U>(self, f: F) -> Device<U, M>
    where
        F: FnOnce(T) -> Device<U, M>,
    {
        f(self.value)
    }

    pub fn to<F, U>(self, f: F) -> U
    where
        F: FnOnce(T) -> U,
    {
        f(self.value)
    }

    pub fn val(self) -> T {
        self.value
    }

    pub fn monad(self) -> SyncMonad<T> {
        SyncMonad::new(self.value)
    }
}

pub fn dev<T, M: Clone>(methods: M) -> impl Fn(T) -> Device<T, M> {
    move |value| Device::new(methods.clone(), value)
}

pub struct AsyncDevice<T: Send + 'static, M> {
    future: BoxFuture<T>,
    methods: M,
    is_device: bool,
    is_async: bool,
}

impl<T: Send + 'static, M: Clone + Send + Sync + 'static> AsyncDevice<T, M> {
    pub fn new<F>(methods: M, future: F) -> Self
    where
        F: Future<Output = T> + Send + 'static,
    {
        AsyncDevice {
            future: Box::pin(future),
            methods,
            is_device: true,
            is_async: true,
        }
    }

    pub fn pdev(methods: M, value: T) -> Self {
        AsyncDevice::new(methods, async move { value })
    }

    pub fn map<F, U>(self, f: F) -> AsyncDevice<U, M>
    where
        F: FnOnce(T) -> U + Send + 'static,
        U: Send + 'static,
    {
        let methods = self.methods;
        AsyncDevice::new(methods, async move {
            let value = self.future.await;
            f(value)
        })
    }

    pub fn tap<F>(self, f: F) -> Self
    where
        F: FnOnce(&T) + Send + 'static,
        T: Sync,
    {
        let methods = self.methods;
        AsyncDevice::new(methods, async move {
            let value = self.future.await;
            f(&value);
            value
        })
    }

    pub fn chain<F, U>(self, f: F) -> AsyncDevice<U, M>
    where
        F: FnOnce(T) -> AsyncDevice<U, M> + Send + 'static,
        U: Send + 'static,
    {
        let methods = self.methods;
        AsyncDevice::new(methods, async move {
            let value = self.future.await;
            f(value).val().await
        })
    }

    pub fn to<F, U>(self, f: F) -> impl Future<Output = U> + Send
    where
        F: FnOnce(T) -> U + Send + 'static,
        U: Send + 'static,
    {
        async move {
            let value = self.future.await;
            f(value)
        }
    }

    pub async fn val(self) -> T {
        self.future.await
    }

    pub fn monad(self) -> AsyncMonad<T> {
        AsyncMonad::new(self.future)
    }
}

pub fn pdev<T: Send + 'static, M: Clone + Send + Sync + 'static>(
    methods: M,
) -> impl Fn(T) -> AsyncDevice<T, M> {
    move |value| AsyncDevice::pdev(methods.clone(), value)
}

// === Option handling ===

pub fn opt<T, F>(compute: F) -> SyncMonad<Option<T>>
where
    F: FnOnce() -> Result<SyncMonad<T>, ()>,
{
    match compute() {
        Ok(monad) => of(Some(monad.val())),
        Err(_) => of(None),
    }
}

pub fn popt<T: Send + 'static, F, Fut>(compute: F) -> AsyncMonad<Option<T>>
where
    F: FnOnce() -> Fut + Send + 'static,
    Fut: Future<Output = Result<T, ()>> + Send + 'static,
{
    AsyncMonad::new(async move {
        match compute().await {
            Ok(value) => Some(value),
            Err(_) => None,
        }
    })
}

// === Tests ===

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sync_monad_operations() {
        let result = of(5)
            .map(|x| x * 2)
            .map(|x| x + 10)
            .val();
        assert_eq!(result, 20);
    }

    #[test]
    fn test_sync_chain() {
        let result = of(5)
            .chain(|x| of(x * 2))
            .val();
        assert_eq!(result, 10);
    }

    #[test]
    fn test_kleisli_arrow() {
        let arrow = ka::<i32>()
            .map(|x| x * 2)
            .map(|x| x + 10);
        
        let result = arrow.into_fn()(5).val();
        assert_eq!(result, 20);
    }

    #[test]
    fn test_arrow_in_chain() {
        let double_arrow = ka::<i32>().map(|x| x * 2);
        
        let result = of(5)
            .chain(double_arrow.into_fn())
            .val();
        assert_eq!(result, 10);
    }

    #[tokio::test]
    async fn test_async_monad() {
        let result = pof!(5)
            .map(|x| x * 2)
            .val()
            .await;
        assert_eq!(result, 10);
    }

    #[tokio::test]
    async fn test_async_with_future() {
        let result = pof!(async { 5 })
            .map(|x| x * 2)
            .val()
            .await;
        assert_eq!(result, 10);
    }

    #[tokio::test]
    async fn test_pka() {
        let arrow = aka::<i32>()
            .map(|x| x * 2)
            .map(|x| x + 10);
        
        let result = arrow.into_fn()(5).val().await;
        assert_eq!(result, 20);
    }

    #[test]
    fn test_device() {
        #[derive(Clone)]
        struct NumMethods;
        
        impl NumMethods {
            fn add(&self, a: i32, b: i32) -> i32 {
                a + b
            }
        }
        
        let methods = NumMethods;
        let device = dev(methods)(10);
        
        let result = device
            .map(|x| x * 2)
            .monad()
            .val();
        assert_eq!(result, 20);
    }
}
