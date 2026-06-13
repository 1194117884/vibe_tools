import Head from 'next/head';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import SidebarLayout from '../components/SidebarLayout';
import '../styles/globals.css';
import '../styles/md-pdf.css';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <SidebarLayout>
          <Component {...pageProps} />
        </SidebarLayout>
      </AuthProvider>
    </ThemeProvider>
  );
}
