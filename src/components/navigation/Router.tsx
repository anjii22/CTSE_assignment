import { ReactNode, useEffect, useState } from 'react';

interface RouteProps {
  path: string;
  component: ReactNode;
}

interface RouterProps {
  routes: RouteProps[];
  notFound?: ReactNode;
}

export const Router = ({ routes, notFound }: RouterProps) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const matchRoute = () => {
    const route = routes.find((r) => {
      if (r.path === currentPath) return true;
      const pathRegex = new RegExp('^' + r.path.replace(/:[^/]+/g, '([^/]+)') + '$');
      return pathRegex.test(currentPath);
    });

    return route ? route.component : notFound || <div>404 - Not Found</div>;
  };

  return <>{matchRoute()}</>;
};
