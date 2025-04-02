import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head> 
        <link rel="stylesheet" href="src/styles/globals.css" type="text/css" media="all" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
