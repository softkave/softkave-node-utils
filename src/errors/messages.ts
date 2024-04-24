export const kAppMessages = {
  token: {
    invalidCredentials: 'Invalid credentials',
  },
  common: {
    notFound(id?: string) {
      return id ? `Resource with ID ${id} not found` : 'Resource not found';
    },
    permissionDenied(id?: string) {
      return id
        ? `Permission denied for resource with ID ${id}`
        : 'Permission denied';
    },
    notImplementedYet(fnName?: string) {
      return fnName ? `${fnName} not implemented yet` : 'Not implemented yet';
    },
    invalidState(state?: string) {
      return state
        ? `Program is in an invalid state:\n ${state}`
        : 'Program is in an invalid state';
    },
  },
};
