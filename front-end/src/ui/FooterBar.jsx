
import React from 'react'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import CoffeeIcon from '@mui/icons-material/Coffee'

export default function FooterBar() {
  return (
    <Toolbar
      variant="dense"
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'action.disabledBackground',
        py: 1
      }}
    >
      <Typography
        variant="caption"
        sx={{ '& a': { color: 'secondary.light' } }}
      >
        Desenvolvido e mantido com <CoffeeIcon fontSize="small" /> por{' '}
        <a href="mailto:professor@faustocintra.com.br">
          Prof. Fausto Cintra
        </a>
      </Typography>

      <Typography
        variant="caption"
        sx={{ '& a': { color: 'secondary.light' } }}
      >
        <a href="mailto:Leonardo.sudario06@gmail.com">
          Aluno: Leonardo Sudario
        </a>
      </Typography>
    </Toolbar>
  )
}
