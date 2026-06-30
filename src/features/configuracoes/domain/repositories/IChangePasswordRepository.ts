import type { ChangePasswordRequest, ChangePasswordResponse } from '../entities';

export interface IChangePasswordRepository {
  changePassword(request: ChangePasswordRequest): Promise<ChangePasswordResponse>;
}
