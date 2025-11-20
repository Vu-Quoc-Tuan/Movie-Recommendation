// Re-export all auth APIs for convenience
export { loginApi, registerApi } from './auth.api';
export { fetchUserHistory, deleteMovieHistory } from './history.api';
export { fetchUserSaved, saveMovieApi } from './saved.api';
