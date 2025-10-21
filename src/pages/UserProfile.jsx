//pages/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiService } from "../services/api";
import { logout } from "../Redux/slices/authSlice";
import Orders from "../components/Orders";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile'); // New state for tab management
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addresses: []
  });

  const [newAddress, setNewAddress] = useState({
    name: "",
    addressLine1: "",
    city: "",
    state: "",
    pinCode: ""
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/";
      return;
    }
    
    // Only fetch profile data when on profile tab
    if (activeTab === 'profile') {
      fetchProfile();
    }
  }, [isAuthenticated, activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProfile();
      setProfileData(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        addresses: response.data.addresses || []
      });
    } catch (error) {
      setError("Failed to fetch profile data");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (index, field, value) => {
    const updatedAddresses = [...formData.addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      addresses: updatedAddresses
    }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNewAddress = () => {
    if (newAddress.name && newAddress.addressLine1) {
      setFormData(prev => ({
        ...prev,
        addresses: [...prev.addresses, { ...newAddress }]
      }));
      setNewAddress({
        name: "",
        addressLine1: "",
        city: "",
        state: "",
        pinCode: ""
      });
    }
  };

  const removeAddress = (index) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProfile = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Don't send email since it can't be updated
    const {...updateData } = formData;
    
    const response = await apiService.updateUserProfile(updateData);
    setProfileData(response.data);
    setSuccess("Profile updated successfully!");
    setEditing(false);
  } catch (error) {
    setError(error.message || "Failed to update profile");
    console.error("Profile update error:", error);
  } finally {
    setLoading(false);
  }
};

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  // Loading state for profile tab only
  if (loading && activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-2">Manage your profile and orders</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                    ? 'border-pink-500 text-pink-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Orders
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div>
                {/* Profile Content */}
                {/* Messages */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                    {success}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                      {!editing ? (
                        <button
                          type="button"
                          onClick={() => setEditing(true)}
                          className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Addresses</h2>
                    
                    {/* Existing Addresses */}
                    {formData.addresses.map((address, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-medium text-gray-900">{address.name}</h3>
                          {editing && (
                            <button
                              type="button"
                              onClick={() => removeAddress(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1
                            </label>
                            <textarea
                              value={address.addressLine1}
                              onChange={(e) => handleAddressChange(index, 'addressLine1', e.target.value)}
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                              rows="2"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={address.city || ""}
                              onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={address.state || ""}
                              onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              PIN Code
                            </label>
                            <input
                              type="text"
                              value={address.pinCode || ""}
                              onChange={(e) => handleAddressChange(index, 'pinCode', e.target.value)}
                              disabled={!editing}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add New Address */}
                    {editing && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
                        <h3 className="font-medium text-gray-900 mb-4">Add New Address</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={newAddress.name}
                              onChange={handleNewAddressChange}
                              placeholder="e.g., Home, Office"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address Line 1
                            </label>
                            <textarea
                              name="addressLine1"
                              value={newAddress.addressLine1}
                              onChange={handleNewAddressChange}
                              placeholder="Enter full address"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                              rows="2"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={newAddress.city}
                              onChange={handleNewAddressChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={newAddress.state}
                              onChange={handleNewAddressChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              PIN Code
                            </label>
                            <input
                              type="text"
                              name="pinCode"
                              value={newAddress.pinCode}
                              onChange={handleNewAddressChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={addNewAddress}
                          className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                        >
                          Add Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Member Since
                        </label>
                        <p className="text-gray-900 py-2">
                          {profileData && new Date(profileData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Updated
                        </label>
                        <p className="text-gray-900 py-2">
                          {profileData && new Date(profileData.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {editing && (
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Updating..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <Orders />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

 