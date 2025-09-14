import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUserPhoto, updateUserProfile } from "@/features/auth/authSlice";
import {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateAdminPhotoMutation,
  useRequestAdminPasswordChangeOTPMutation,
  useChangeAdminPasswordMutation,
} from "../adminApiSlice";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Camera, Save, Eye, EyeOff, User, Shield, Image as ImageIcon } from "lucide-react";
import { getInitials } from "@/lib/utils";

const AdminProfileSettings = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug logging
  console.log("🔍 AdminProfileSettings rendered");
  console.log("🔍 Current user:", user);
  console.log("🔍 User ID:", user?._id);

  // Form states
  const [profileData, setProfileData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    photo: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [otpData, setOtpData] = useState({
    otp: "",
    showOtpStep: false,
    email: "",
  });

  // API hooks
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetAdminProfileQuery(user?._id);
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateAdminProfileMutation();
  const [updatePhoto, { isLoading: updatingPhoto }] = useUpdateAdminPhotoMutation();
  const [requestPasswordOTP, { isLoading: requestingOTP }] = useRequestAdminPasswordChangeOTPMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangeAdminPasswordMutation();

  // Debug API state
  console.log("Profile API state:", { profile, profileLoading, profileError });

  // Initialize profile data when profile is loaded
  React.useEffect(() => {
    if (profile?.data) {
      setProfileData({
        fullname: profile.data.fullname || "",
        email: profile.data.email || "",
        phoneNumber: profile.data.phoneNumber || "",
        photo: profile.data.photo || "",
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      // Only send the fields that can be updated in profile (exclude photo)
      const { photo, ...profileUpdateData } = profileData;
      
      const result = await updateProfile({
        id: user._id,
        data: profileUpdateData,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Profile Updated!",
          description: "Your profile has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Update the global user state to sync with dashboard and other components
        if (result.data) {
          dispatch(updateUserProfile({
            fullname: result.data.fullname,
            email: result.data.email,
            phoneNumber: result.data.phoneNumber,
            photo: result.data.photo,
          }));
        }
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: error?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePhotoUpdate = async (file) => {
    if (!file) return;

    try {
      console.log("🔄 Starting photo update...");
      console.log("📁 File:", file);
      console.log("🆔 User ID:", user._id);

      const result = await updatePhoto({
        id: user._id,
        photo: file,
      }).unwrap();

      console.log("✅ Photo update result:", result);

      if (result.success) {
        toast({
          title: "Photo Updated!",
          description: "Your profile photo has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });

        // Update the global user state
        if (result.data?.photo) {
          console.log("🖼️ Updating UI with photo:", result.data.photo);
          
          // Update Redux state for immediate UI update
          dispatch(updateUserPhoto({ photo: result.data.photo }));
          
          // Update local profile state to trigger re-render
          setProfileData(prev => ({
            ...prev,
            photo: result.data.photo
          }));
          
          // Also update the user profile in Redux for consistency
          dispatch(updateUserProfile({
            photo: result.data.photo
          }));
          
          console.log("✅ Photo state updated successfully in all stores");
        } else {
          console.warn("⚠️ No photo URL in response data:", result.data);
        }
      }
    } catch (error) {
      console.error("❌ Photo update error:", error);
      toast({
        title: "Photo Update Failed",
        description: error?.data?.message || "Failed to update photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await requestPasswordOTP({
        id: user._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }).unwrap();

      if (result.success) {
        setOtpData({
          otp: "",
          showOtpStep: true,
          email: result.data.email,
        });
        
        toast({
          title: "OTP Sent!",
          description: `OTP has been sent to ${result.data.email}`,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        });
      }
    } catch (error) {
      console.error("Password change request error:", error);
      toast({
        title: "Request Failed",
        description: error?.data?.message || "Failed to request password change. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();
    
    if (!otpData.otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP sent to your email.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await changePassword({
        id: user._id,
        otp: otpData.otp,
        newPassword: passwordData.newPassword,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Password Changed!",
          description: "Your password has been changed successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Reset form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setOtpData({
          otp: "",
          showOtpStep: false,
          email: "",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Change Failed",
        description: error?.data?.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a valid image file (JPEG, PNG, or GIF).",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      handlePhotoUpdate(file);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">
            {profileError?.data?.message || "Failed to load profile. Please try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin account information and preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.data?.photo || user?.photo} />
              <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
                {getInitials(profile?.data?.fullname || user?.fullname || "Admin")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.data?.fullname || user?.fullname || "Admin Name"}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Admin
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  System Administrator
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {profile?.data?.email || user?.email || "admin@example.com"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <User className="h-4 w-4 mr-2" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger 
            value="photo" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Photo
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input
                      id="fullname"
                      value={profileData.fullname}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullname: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={updatingProfile}>
                    {updatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!otpData.showOtpStep ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={requestingOTP}>
                      {requestingOTP ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Request OTP"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleOTPVerification} className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      We've sent a 6-digit OTP to <strong>{otpData.email}</strong>. 
                      Please check your email and enter the OTP below.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      value={otpData.otp}
                      onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value }))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOtpData({ otp: "", showOtpStep: false, email: "" })}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Tab */}
        <TabsContent value="photo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>
                Update your profile photo. Supported formats: JPEG, PNG, GIF (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profileData.photo} alt="Profile" />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profileData.fullname)}
                    </AvatarFallback>
                  </Avatar>
                  {updatingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to select a new photo
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updatingPhoto}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {updatingPhoto ? "Uploading..." : "Choose Photo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProfileSettings;
