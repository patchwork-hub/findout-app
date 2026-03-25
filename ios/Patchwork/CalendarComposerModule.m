#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CalendarComposerModule, NSObject)

RCT_EXTERN_METHOD(presentEventEditor:(NSDictionary *)payload
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
