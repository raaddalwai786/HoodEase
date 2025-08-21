import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import LoginPage from './LoginPage'
import ProfileCreation from './ProfileCreation'   // if you have it
import Dashboard from './Dashboard'               // create this file (below)

const router = createBrowserRouter([
  { path: '/', element: <LoginPage /> },
  { path: '/profile', element: <ProfileCreation /> }, // optional
  { path: '/dashboard', element: <Dashboard /> },
  { path: '*', element: <div style={{padding:16}}>Not Found</div> },
])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
)
