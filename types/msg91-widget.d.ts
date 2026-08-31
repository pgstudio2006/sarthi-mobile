declare module '@msg91comm/sendotp-react-native' {
  export class OTPWidget {
    static initializeWidget(widgetId: string, tokenAuth: string): Promise<void>;
    static sendOTP(body: { identifier: string; [key: string]: any }): Promise<any>;
    static verifyOTP(body: { reqId: string; otp: string; [key: string]: any }): Promise<any>;
    static retryOTP(body: { reqId: string; retryChannel?: number; [key: string]: any }): Promise<any>;
    static getWidgetProcess(): Promise<any>;
  }

  export class BiometricAuth {
    static isSensorAvailable(): Promise<any>;
    static authenticate(): Promise<any>;
    static getBiometricType(): Promise<any>;
    static simplePrompt(options: any): Promise<any>;
    static cancelAuthentication(): Promise<any>;
  }

  export const BiometryTypes: {
    TouchID: string;
    FaceID: string;
    Biometrics: string;
    FaceRecognition: string;
    Fingerprint: string;
  };

  export const DefaultWidget: any;
}
