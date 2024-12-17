import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AddUserService {
  private keycloakUrl = 'http://localhost:8080'; // Keycloak base URL
  private realm = 'nestjs-app'; // Realm name
  private clientId = 'nestjs-app'; // Client ID for the admin client
  private clientSecret = 'W0pakV1xlSgdNm51prS9NXjd0sCJXmoI'; // Client secret from Keycloak

  async addUser(user: { username: string; email: string; password: string }) {
    try {
      // 1. Obtenir un access token RH
      const tokenResponse = await axios.post(
        `${this.keycloakUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const accessToken = tokenResponse.data.access_token;

      // 2. Créer l'utilisateur
      const createUserResponse = await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users`, // Correction de l'URL
        {
          username: user.username,
          email: user.email,
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: user.password,
              temporary: false,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (createUserResponse.status !== 201) {
        throw new Error('Failed to create user');
      }

      // 3. Récupérer l'ID de l'utilisateur nouvellement créé
      const usersResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users?username=${user.username}`, // Correction
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const userId = usersResponse.data[0]?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // 4. Récupérer l'ID du rôle 'employee'
      const rolesResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/roles`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const employeeRole = rolesResponse.data.find((role) => role.name === 'employee');
      if (!employeeRole) {
        throw new Error('Role "employee" not found');
      }

      // 5. Assigner le rôle 'employee' à l'utilisateur
      await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
        [
          {
            id: employeeRole.id,
            name: employeeRole.name,
          },
        ],
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      return { message: 'User successfully registered with employee role' };
    } catch (error) {
      console.error('Error during registration:', error.response?.data || error.message);
      throw new HttpException(
        error.response?.data || 'Registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
