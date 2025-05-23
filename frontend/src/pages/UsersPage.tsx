import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user?.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={() => navigate('/users/invite')}>
          Invite New User
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Add users list table */}
          <p>Users list will be displayed here</p>
        </CardContent>
      </Card>
    </div>
  );
}; 