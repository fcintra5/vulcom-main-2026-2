import React from 'react'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import AuthUserContext from '../contexts/AuthUserContext'
import { Link } from 'react-router-dom'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom'
import useWaiting from './useWaiting'
import useConfirmDialog from './useConfirmDialog'
import useNotification from './useNotification'
import myfetch from '../lib/myfetch'

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=None; Secure`
}

export default function AuthControl() {
  const { authUser, setAuthUser } = React.useContext(AuthUserContext)

  const { showWaiting, Waiting } = useWaiting()
  const { askForConfirmation, ConfirmDialog } = useConfirmDialog()
  const { notify, Notification } = useNotification()

  const navigate = useNavigate()

  async function handleLogoutButtonClick() {
    if(await askForConfirmation('Deseja realmente sair?')) {
      // OWASP Top 10:2025 A07 - Falhas de Autenticação:
      // o logout só remove a cópia local; não revoga o JWT nem encerra o cookie no servidor.
      // Apaga o token do localStorage
      window.localStorage.removeItem(import.meta.env.VITE_AUTH_TOKEN_NAME)

      // Apaga o cookie acessível por JavaScript com o token de autenticação
      deleteCookie(`${import.meta.env.VITE_AUTH_TOKEN_NAME}`)

      // Encerra a sessão no back-end, removendo os cookies de autenticação
      try {
        await myfetch.post('/users/logout')
      }
      catch(error) {
        console.error(error)
      }

      // Remove as informações do usuário autenticado
      setAuthUser(null)

      // Redireciona para a página de login
      navigate('/login')
    }
  }

  if(authUser) {
    return (
      <>
        <Waiting />
        <Notification />
        <ConfirmDialog />

        <AccountCircleIcon color="secondary" fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="caption">
          {authUser.username}
        </Typography>
        <Button 
          color="secondary"
          size="small"
          onClick={handleLogoutButtonClick}
          sx={{
            ml: 0.75, // ml: marginLeft
          }}
        >
          Sair
        </Button>
      </>
    )
  }
  else {
    return (
      <Link to="/login">
        <Button color="secondary">Entrar</Button>
      </Link>
    )
  }

}