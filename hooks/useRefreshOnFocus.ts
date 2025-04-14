// hooks/useRefreshOnFocus.ts
import { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefreshOnFocus(refetch: () => void) {
  const enabledRef = useRef(false);

  useFocusEffect(() => {
    if (enabledRef.current) {
      refetch();
    } else {
      enabledRef.current = true;
    }
  });
}