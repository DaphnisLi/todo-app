import { useState, useEffect, useCallback } from 'react';
import { Identity, Role } from '../types';
import { StorageService } from '../storage';

export function useIdentities() {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载身份和角色
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [storedIdentities, storedRoles] = await Promise.all([
        StorageService.getIdentities(),
        StorageService.getRoles(),
      ]);

      setIdentities(storedIdentities.map(identity => ({
        ...identity,
        createdAt: new Date(identity.createdAt),
        updatedAt: new Date(identity.updatedAt),
      })));

      setRoles(storedRoles);
    } catch (err) {
      setError('加载数据失败');
      console.error('Load identities error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存身份
  const saveIdentities = useCallback(async (newIdentities: Identity[]) => {
    try {
      await StorageService.setIdentities(newIdentities);
      setIdentities(newIdentities);
    } catch (err) {
      setError('保存身份失败');
      console.error('Save identities error:', err);
      throw err;
    }
  }, []);

  // 保存角色
  const saveRoles = useCallback(async (newRoles: Role[]) => {
    try {
      await StorageService.setRoles(newRoles);
      setRoles(newRoles);
    } catch (err) {
      setError('保存角色失败');
      console.error('Save roles error:', err);
      throw err;
    }
  }, []);

  // 添加身份
  const addIdentity = useCallback(async (identityData: Omit<Identity, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIdentity: Identity = {
      ...identityData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newIdentities = [...identities, newIdentity];
    await saveIdentities(newIdentities);
    return newIdentity;
  }, [identities, saveIdentities]);

  // 更新身份
  const updateIdentity = useCallback(async (id: string, updates: Partial<Identity>) => {
    const newIdentities = identities.map(identity =>
      identity.id === id
        ? { ...identity, ...updates, updatedAt: new Date() }
        : identity
    );
    await saveIdentities(newIdentities);
  }, [identities, saveIdentities]);

  // 删除身份
  const deleteIdentity = useCallback(async (id: string) => {
    const identity = identities.find(i => i.id === id);
    if (!identity) return;

    if (identity.isDefault) {
      throw new Error('不能删除默认身份');
    }

    // 找到默认身份
    const defaultIdentity = identities.find(i => i.isDefault);
    if (!defaultIdentity) {
      throw new Error('没有找到默认身份');
    }

    // 删除身份并转移相关数据到默认身份
    const newIdentities = identities.filter(i => i.id !== id);
    await saveIdentities(newIdentities);

    return defaultIdentity.id;
  }, [identities, saveIdentities]);

  // 设置默认身份
  const setDefaultIdentity = useCallback(async (id: string) => {
    const newIdentities = identities.map(identity => ({
      ...identity,
      isDefault: identity.id === id,
      updatedAt: new Date(),
    }));
    await saveIdentities(newIdentities);
  }, [identities, saveIdentities]);

  // 添加角色
  const addRole = useCallback(async (roleData: Omit<Role, 'id'>) => {
    const newRole: Role = {
      ...roleData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const newRoles = [...roles, newRole];
    await saveRoles(newRoles);
    return newRole;
  }, [roles, saveRoles]);

  // 更新角色
  const updateRole = useCallback(async (id: string, updates: Partial<Role>) => {
    const newRoles = roles.map(role =>
      role.id === id ? { ...role, ...updates } : role
    );
    await saveRoles(newRoles);
  }, [roles, saveRoles]);

  // 删除角色
  const deleteRole = useCallback(async (id: string) => {
    const newRoles = roles.filter(role => role.id !== id);
    await saveRoles(newRoles);
  }, [roles, saveRoles]);

  // 获取默认身份
  const getDefaultIdentity = useCallback((): Identity | null => {
    return identities.find(identity => identity.isDefault) || null;
  }, [identities]);

  // 获取身份的角色
  const getRolesByIdentity = useCallback((identityId: string): Role[] => {
    return roles.filter(role => role.identityId === identityId);
  }, [roles]);

  // 获取身份名称
  const getIdentityName = useCallback((identityId: string): string => {
    const identity = identities.find(i => i.id === identityId);
    return identity?.name || '未知身份';
  }, [identities]);

  // 获取角色名称
  const getRoleName = useCallback((roleId: string): string => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || '未知角色';
  }, [roles]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    identities,
    roles,
    loading,
    error,
    loadData,
    addIdentity,
    updateIdentity,
    deleteIdentity,
    setDefaultIdentity,
    addRole,
    updateRole,
    deleteRole,
    getDefaultIdentity,
    getRolesByIdentity,
    getIdentityName,
    getRoleName,
  };
}
