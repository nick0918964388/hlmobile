'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { User } from '@/services/api';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  hasPermission: (permission: string) => boolean;
  isInGroup: (group: string) => boolean;
  refetchUser: () => Promise<void>;
}

const initialUserContext: UserContextType = {
  user: null,
  loading: true,
  error: null,
  hasPermission: () => false,
  isInGroup: () => false,
  refetchUser: async () => {}
};

const UserContext = createContext<UserContextType>(initialUserContext);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await api.user.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const isInGroup = (group: string): boolean => {
    if (!user || !user.groups) return false;
    return user.groups.includes(group);
  };

  const refetchUser = async (): Promise<void> => {
    await fetchUser();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        error,
        hasPermission,
        isInGroup,
        refetchUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext; 