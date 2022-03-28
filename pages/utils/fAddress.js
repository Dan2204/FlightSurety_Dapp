const fAddress = (address, length = null) => {
  const digits = length ? length : 3;

  if (address) {
    return `${address.slice(0, digits)}...${address.slice(-digits)}`;
  }
  return 'Invalid';
};

export default fAddress;
