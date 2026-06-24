import axios from 'axios'

// Create ONE configured Axios client the whole app shares.
const axiosInstance = axios.create({
  // baseURL is read from the environment variable, so it changes per environment
  // (localhost while developing, the cloud API once deployed).
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// REQUEST INTERCEPTOR: runs automatically BEFORE every request leaves the app.
// Its job: if we have a saved login token, attach it so the backend knows who we are.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') // where we'll store the JWT after login
    if (token) {
      // Standard format the backend expects: "Authorization: Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`
    }
    return config // you MUST return config, or the request never goes out
  },
  (error) => Promise.reject(error), // pass request-setup errors along
)

// RESPONSE INTERCEPTOR: runs automatically when a response comes BACK.
// Its job: if the backend says 401 (not logged in / token expired),
// clear the bad token. (Redirecting to /login can be added later.)
axiosInstance.interceptors.response.use(
  (response) => response, // success: pass it straight through
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error) // let the calling code also handle the error
  },
)

export default axiosInstance
