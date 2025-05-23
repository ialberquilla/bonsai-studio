import { useEffect, useState } from 'react'

export default (): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true)
  }, []);

  return isMounted;
};
