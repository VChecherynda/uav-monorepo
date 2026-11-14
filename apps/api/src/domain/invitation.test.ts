import { canUseInvitation } from './invitation.js';

import { describe, expect, it } from 'vitest';

describe('canUseInvitation', () => {
  const presentMS = Date.now();
  const present = new Date(presentMS);
  const past = new Date(presentMS - 10000);
  const future = new Date(presentMS + 10000);

  it('can use invitation', () => {
    expect(
      canUseInvitation({ expiresAt: future, usedAt: null }, present),
    ).toEqual({
      status: 'success',
    });
  });

  it.each([
    [null, { code: 'INVITATION_NOT_FOUND', message: 'Invitation not found' }],
    [
      { expiresAt: past, usedAt: null },
      { code: 'INVITATION_IS_EXPIRED', message: 'Invitation is expired' },
    ],
    [
      { expiresAt: future, usedAt: present },
      {
        code: 'INVITATION_ALREADY_USED',
        message: 'Invitation has already been used',
      },
    ],
  ])('rejects with reason: %s', (invitation, reason) => {
    expect(canUseInvitation(invitation, present)).toEqual({
      status: 'rejected',
      reason,
    });
  });
});
