// Client login credentials for the /intake self-service property forms.
// username = the client's email, password = a password they choose.
// propertyIds lists which properties.js entries this client is allowed to
// add to / edit — add a real entry here for each client before sharing
// their login with them. This is a plain credential list, not real auth —
// fine for an internal tool gated behind a shared link, not for anything
// public-facing without a real backend.
const clients = [
  {
    email: "demo@example.com",
    password: "demo1234",
    propertyIds: ["villa-savyon", "house-ramat-hasharon"],
  },
];

export default clients;
