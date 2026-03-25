import Foundation
import UIKit
import EventKit
import EventKitUI

@objc(CalendarComposerModule)
final class CalendarComposerModule: NSObject, EKEventEditViewDelegate {
  private let eventStore = EKEventStore()
  private var pendingResolve: RCTPromiseResolveBlock?
  private var pendingReject: RCTPromiseRejectBlock?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    true
  }

  @objc(presentEventEditor:resolver:rejecter:)
  func presentEventEditor(
    _ payload: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      guard self.pendingResolve == nil else {
        reject("calendar_busy", "Calendar editor is already open.", nil)
        return
      }

      guard let title = payload["title"] as? String, !title.isEmpty,
            let startDateString = payload["startDate"] as? String,
            let startDate = Self.parseISODate(startDateString) else {
        reject("invalid_payload", "Missing or invalid title/startDate.", nil)
        return
      }

      self.pendingResolve = resolve
      self.pendingReject = reject

      self.requestCalendarAccess { granted, error in
        DispatchQueue.main.async {
          guard granted else {
            self.finishWithError(
              code: "calendar_permission_denied",
              message: error?.localizedDescription ?? "Calendar access was denied."
            )
            return
          }

          guard let presenter = Self.topViewController() else {
            self.finishWithError(code: "no_presenter", message: "Unable to present Calendar.")
            return
          }

          let event = EKEvent(eventStore: self.eventStore)
          event.title = title
          event.startDate = startDate

          if let endDateString = payload["endDate"] as? String,
             let endDate = Self.parseISODate(endDateString),
             endDate >= startDate {
            event.endDate = endDate
          } else {
            event.endDate = startDate.addingTimeInterval(60 * 60)
          }

          if let location = payload["location"] as? String, !location.isEmpty {
            event.location = location
          }

          if let notes = payload["notes"] as? String, !notes.isEmpty {
            event.notes = notes
          }

          if let urlString = payload["url"] as? String,
             !urlString.isEmpty,
             let url = URL(string: urlString) {
            event.url = url
          }

          guard let calendar = self.eventStore.defaultCalendarForNewEvents else {
            self.finishWithError(code: "no_default_calendar", message: "No default calendar is configured.")
            return
          }

          event.calendar = calendar

          let editor = EKEventEditViewController()
          editor.eventStore = self.eventStore
          editor.event = event
          editor.editViewDelegate = self
          presenter.present(editor, animated: true)
        }
      }
    }
  }

  func eventEditViewController(_ controller: EKEventEditViewController, didCompleteWith action: EKEventEditViewAction) {
    let eventIdentifier = controller.event?.eventIdentifier

    controller.dismiss(animated: true) {
      switch action {
      case .saved:
        self.finishWithResult(status: "saved", eventIdentifier: eventIdentifier)
      case .deleted:
        self.finishWithResult(status: "deleted", eventIdentifier: eventIdentifier)
      case .canceled:
        self.finishWithResult(status: "canceled", eventIdentifier: nil)
      @unknown default:
        self.finishWithResult(status: "canceled", eventIdentifier: nil)
      }
    }
  }

  private func requestCalendarAccess(_ completion: @escaping (Bool, Error?) -> Void) {
    let status = EKEventStore.authorizationStatus(for: .event)

    if #available(iOS 17.0, *) {
      switch status {
      case .fullAccess, .writeOnly:
        completion(true, nil)
      case .notDetermined:
        eventStore.requestFullAccessToEvents(completion: completion)
      default:
        completion(false, nil)
      }
    } else {
      switch status {
      case .authorized:
        completion(true, nil)
      case .notDetermined:
        eventStore.requestAccess(to: .event, completion: completion)
      default:
        completion(false, nil)
      }
    }
  }

  private func finishWithResult(status: String, eventIdentifier: String?) {
    var result: [String: Any] = ["status": status]
    if let eventIdentifier {
      result["eventIdentifier"] = eventIdentifier
    }
    pendingResolve?(result)
    pendingResolve = nil
    pendingReject = nil
  }

  private func finishWithError(code: String, message: String) {
    pendingReject?(code, message, nil)
    pendingResolve = nil
    pendingReject = nil
  }

  private static func parseISODate(_ value: String) -> Date? {
    let f1 = ISO8601DateFormatter()
    f1.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = f1.date(from: value) { return date }

    let f2 = ISO8601DateFormatter()
    f2.formatOptions = [.withInternetDateTime]
    return f2.date(from: value)
  }

  private static func topViewController(base: UIViewController? = {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap { $0.windows }
      .first(where: \.isKeyWindow)?
      .rootViewController
  }()) -> UIViewController? {
    if let nav = base as? UINavigationController {
      return topViewController(base: nav.visibleViewController)
    }
    if let tab = base as? UITabBarController {
      return topViewController(base: tab.selectedViewController)
    }
    if let presented = base?.presentedViewController {
      return topViewController(base: presented)
    }
    return base
  }
}
