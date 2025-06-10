function fetchUserSession() {
  return fetch('../php/check_session.php')
    .then(res => res.json())
    .catch(err => {
      console.error('Error checking session', err);
      return { logged_in: false };
    });
}
