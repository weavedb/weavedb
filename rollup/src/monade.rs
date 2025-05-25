use std::any::Any;
use std::future::Future;
use std::marker::PhantomData;
use std::pin::Pin;
use std::sync::Arc;

type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send>>;
type BoxFutureDyn = Pin<Box<dyn Future<Output = Box<dyn Any + Send>> + Send>>;

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

pub struct AsyncMonad<T: 'static + Send> {
    future: BoxFuture<T>,
}

impl<T: 'static + Send> AsyncMonad<T> {
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
        let future = async move {
            let value = self.future.await;
            let result = f(value);
            handle_map_output(result).await
        };
        AsyncMonad::new(future)
    }

    pub fn tap<F>(self, f: F) -> Self
    where
        F: FnOnce(&T) + Send + 'static,
        T: Sync,
    {
        let future = async move {
            let value = self.future.await;
            f(&value);
            value
        };
        AsyncMonad::new(future)
    }

    pub fn chain<F, U>(self, f: F) -> AsyncMonad<U>
    where
        F: FnOnce(T) -> AsyncMonad<U> + Send + 'static,
        U: Send + 'static,
    {
        let future = async move {
            let value = self.future.await;
            f(value).val().await
        };
        AsyncMonad::new(future)
    }

    pub async fn val(self) -> T {
        self.future.await
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
}

async fn handle_map_output<T: Send + 'static>(value: T) -> T {
    value
}

async fn handle_chain_output<T: Send + 'static>(value: T) -> T {
    value
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

pub fn ka<T: 'static>() -> SyncFnPipeline<T> {
    SyncFnPipeline::new()
}

pub fn aka<T: Send + 'static>() -> AsyncFnPipeline<T> {
    AsyncFnPipeline::new()
}

pub struct SyncFnPipeline<T> {
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

pub struct AsyncFnPipeline<T: Send + 'static> {
    steps: Arc<Vec<Arc<dyn Fn(Box<dyn Any + Send>) -> BoxFutureDyn + Send + Sync>>>,
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
        steps.push(Arc::new(move |x| {
            let val = *x.downcast::<T>().unwrap();
            let res = f(val);
            Box::pin(async move { Box::new(res) as Box<dyn Any + Send> })
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
        steps.push(Arc::new(move |x| {
            let val = *x.downcast::<T>().unwrap();
            f(&val);
            Box::pin(async move { Box::new(val) as Box<dyn Any + Send> })
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
