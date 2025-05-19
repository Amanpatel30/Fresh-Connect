import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './UserForm.css';

const UserForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('age', formData.age);
            formDataToSend.append('image', formData.image);

            // First test the server connection
            await axios.get('http://localhost:5001/api/test', { timeout: 3000 });

            // If server is reachable, submit the form
            await axios.post('http://localhost:5001/api/users', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 5001
            });
            
            navigate('/users');
        } catch (error) {
            console.error('Error details:', error);
            
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
                setErrorMessage('Cannot connect to the server. Please make sure the backend is running.');
            } else if (error.response) {
                setErrorMessage(`Server error: ${error.response.data.message || error.response.statusText}`);
            } else {
                setErrorMessage(`Error submitting form: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Add User</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Age:</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <label>Image:</label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        required
                    />
                </div>

                {errorMessage && <div className="error-message">{errorMessage}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default UserForm; 