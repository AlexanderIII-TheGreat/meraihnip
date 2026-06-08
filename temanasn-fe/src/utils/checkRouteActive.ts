const checkRouteActive = (
  path: string,
  currentPath: string = '',
  id: number = 0,
  exact: boolean = false
) => {
  if (currentPath === '') {
    currentPath = window.location.pathname;
  }

  // Normalize paths to ignore potential trailing slashes for comparison
  const normalizedPath = path === '/' ? '/' : path.replace(/\/$/, '');
  const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

  if (normalizedPath === '/') {
    return normalizedCurrentPath === '/';
  }

  if (exact) {
    return normalizedCurrentPath === normalizedPath;
  }

  if (id) {
    return normalizedCurrentPath.includes(`/${id}`) && normalizedCurrentPath.includes(normalizedPath);
  } else {
    return (
      normalizedCurrentPath === normalizedPath ||
      normalizedCurrentPath.startsWith(normalizedPath + '/')
    );
  }
};

export default checkRouteActive;

// const checkRouteActive = (
//   id: string,
//   path: string,
//   currentPath: string = ''
// ) => {
//   if (currentPath === '') {
//     currentPath = window.location.pathname;
//   }

//   if (path === '/') {
//     // Jika path adalah '/', periksa apakah ID sesuai dengan ID pada URL
//     return path === currentPath && currentPath.includes(`/${id}/`);
//   }

//   // Jika path bukan '/', periksa apakah ID dan path sesuai dengan URL
//   return currentPath.includes(`/${id}/`) && currentPath.includes(path);
// };

// export default checkRouteActive;
