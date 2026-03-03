import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { setTokenFromCallback } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setTokenFromCallback(token)
      navigate('/?auth=success', { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [searchParams, setTokenFromCallback, navigate])

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-zinc-400">Iniciando sesión…</p>
    </div>
  )
}
