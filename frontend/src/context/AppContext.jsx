import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [equipment, setEquipment] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [equipmentRes, teamsRes, usersRes, categoriesRes, workCentersRes] =
        await Promise.all([
          api.get('/equipment'),
          api.get('/teams'),
          api.get('/users'),
          api.get('/categories'),
          api.get('/work-centers')
        ]);

      setEquipment(equipmentRes.data.data || []);
      setTeams(teamsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setWorkCenters(workCentersRes.data.data || []);
    } catch (error) {
      console.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const refreshEquipment = async () => {
    const response = await api.get('/equipment');
    setEquipment(response.data.data || []);
  };

  return (
    <AppContext.Provider value={{
      equipment, teams, users, categories, workCenters,
      loading, refreshEquipment
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);