import { createContext, useState } from 'react';

const ContractContext = createContext({
  currentMessage: '',
  flightMessage: '',
  onSetMessage: (message) => {},
  onSetFlightMessage: (message) => {},
});

export const ContractContextProvider = (props) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [flightMessage, setFlightMessage] = useState('');

  const setMessageHandler = (message) => {
    setCurrentMessage(() => message);
    setTimeout(() => setCurrentMessage(''), 10000);
  };

  const setFlightMessageHandler = (message) => {
    setFlightMessage(() => message);
    setTimeout(() => setFlightMessage(''), 10000);
  };

  return (
    <ContractContext.Provider
      value={{
        currentMessage: currentMessage,
        flightMessage: flightMessage,
        onSetMessage: setMessageHandler,
        onSetFlightMessage: setFlightMessageHandler,
      }}
    >
      {props.children}
    </ContractContext.Provider>
  );
};

export default ContractContext;
