import { precacheAndRoute } from "workbox-precaching/precacheAndRoute"

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener("notificationclose", event => {
  const notification = event.notification
  const primaryKey = notification.data.primaryKey

  console.log("Closed notification: " + primaryKey)
})
self.addEventListener("notificationclick", event => {
  if (event.notification.data.to != undefined) {
    clients.openWindow(event.notification.data.to)
  }
  event.notification.close()
})
self.addEventListener("push", event => {})
