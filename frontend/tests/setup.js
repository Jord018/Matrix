import { beforeEach } from 'vitest'

// The cart store persists to localStorage; start every test with an empty one.
beforeEach(() => localStorage.clear())
