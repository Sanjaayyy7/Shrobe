
import { createContext, ReactNode, useContext, useState } from 'react';

type UserProfile = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  biography: string;
  age: number;
};

type UserContextType = {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
};

const UserContext = createContext<UserContextType>({
  profile: null,
  setProfile: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  return (
    <UserContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserContext.Provider>
  );
};