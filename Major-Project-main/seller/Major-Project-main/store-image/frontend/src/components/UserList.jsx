import { useEffect, useState } from 'react';
import axios from 'axios';
import './UserList.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5001/api/users');
                setUsers(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please make sure the server is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <div className="loading-message">Loading users...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (users.length === 0) {
        return <div className="no-users-message">No users found. Please add some users.</div>;
    }

    return (
        <div className="container">
            <h2>User List</h2>
            <div className="user-list">
                {users.map((user) => (
                    <div key={user._id} className="user-item">
                        <img 
                            src={`http://localhost:5001/api/users/image/${user._id}`} 
                            alt={user.name}
                        />
                        <p>Name: {user.name}</p>
                        <p>Age: {user.age}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList; 