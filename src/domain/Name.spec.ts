import { describe, it, expect } from 'vitest';

import { Name } from './Name';

describe('Name', () => {
  it.each([
    { from: ' \r Name with spaces around\t\n', to: 'Name with spaces around' },
    { from: ' Name\r\nwith space \tbetween', to: 'Name with space between' },
  ])('should normalize $from to $to', ({ from, to }) => {
    expect(Name.of(from).get).toBe(to);
  });
});
