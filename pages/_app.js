import '../styles/globals.css';
import { ContractContextProvider } from './components/store/fsControl-context';
import '@fortawesome/fontawesome-svg-core/styles.css'; // import Font Awesome CSS
import { config } from '@fortawesome/fontawesome-svg-core';
config.autoAddCss = false;

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ContractContextProvider>
        <Component {...pageProps} />;
      </ContractContextProvider>
    </>
  );
}

export default MyApp;
