declare module 'flutterwave-node-v3' {
  export default class Flutterwave {
    constructor(publicKey: string, secretKey: string, encryptionKey?: string)
    customer: {
      create(data: {
        email: string
        name: string
        phone_number?: string
        country?: string
      }): Promise<{ status: string; message: string; data?: { id?: string | number } }>
    }
    Payment: {
      initialize(data: any): Promise<{ status: string; data?: { link?: string } }>
    }
  }
}