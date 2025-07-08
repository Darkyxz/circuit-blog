'use client';

import { Suspense } from 'react';
import Loading from '../loading/Loading';

const LoadingBoundary = ({ children, fallback = <Loading /> }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LoadingBoundary;
