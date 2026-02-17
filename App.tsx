import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { useIdentities } from './src/hooks/useIdentities';
import { useAppState } from './src/hooks/useAppState';
import { Identity } from './src/types';

export default function App() {
  const { identities, addIdentity, getDefaultIdentity, loading: identitiesLoading } = useIdentities();
  const { appState, setCurrentIdentityId, loading: appStateLoading } = useAppState();

  // 初始化默认身份
  useEffect(() => {
    const initializeDefaultIdentity = async () => {
      if (!identitiesLoading && !appStateLoading) {
        const defaultIdentity = getDefaultIdentity();
        
        if (!defaultIdentity && identities.length === 0) {
          // 创建默认身份
          try {
            const newIdentity: Omit<Identity, 'id' | 'createdAt' | 'updatedAt'> = {
              name: '默认身份',
              avatar: 'default',
              isDefault: true,
              roles: [
                {
                  id: 'default-role',
                  name: '默认角色',
                  identityId: '', // 会在addIdentity中设置
                },
              ],
            };
            
            const createdIdentity = await addIdentity(newIdentity);
            setCurrentIdentityId(createdIdentity.id);
          } catch (error) {
            console.error('Failed to create default identity:', error);
          }
        } else if (defaultIdentity && !appState.currentIdentityId) {
          // 设置当前身份为默认身份
          setCurrentIdentityId(defaultIdentity.id);
        } else if (!appState.currentIdentityId && identities.length > 0) {
          // 设置第一个身份为当前身份
          setCurrentIdentityId(identities[0].id);
        }
      }
    };

    initializeDefaultIdentity();
  }, [identities, identitiesLoading, appStateLoading, appState.currentIdentityId, getDefaultIdentity, addIdentity, setCurrentIdentityId]);

  // 如果还在加载中，显示加载界面
  if (identitiesLoading || appStateLoading || !appState.currentIdentityId) {
    return (
      <SafeAreaProvider>
        <StatusBar style="auto" />
        {/* 这里可以添加一个加载组件 */}
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <HomeScreen />
    </SafeAreaProvider>
  );
}
