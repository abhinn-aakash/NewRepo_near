import { NearService } from "./Near.service";

function logout(): void {
  NearService.logout();
  window.location.replace(window.location.origin + window.location.pathname);
}

async function login(): Promise<void> {
  try {
    await NearService.login();
  } catch (error) {
    console.log("near login error", error);
  }
}

export const AuthService = {
  logout,
  login,
};
