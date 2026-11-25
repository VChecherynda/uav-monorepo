import { z } from 'zod';

const buildReason = <C extends string>(code: C) => {
  return z.object({
    code: z.literal(code),
    message: z.string(),
  });
};

export const RefreshTokenRejectReasonSchema = z.discriminatedUnion('code', [
  buildReason('REFRESH_TOKEN_NOT_FOUND'),
  buildReason('REFRESH_TOKEN_IS_EXPIRED'),
  buildReason('REFRESH_TOKEN_ALREADY_USED'),
]);

export type RefreshTokenRejectReason = z.infer<
  typeof RefreshTokenRejectReasonSchema
>;

export type RefreshTokensServiceResult =
  | { status: 'success'; accessToken: string; refreshToken: string }
  | {
      status: 'rejected';
      code: RefreshTokenRejectReason['code'];
    };
