import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, updateUserPhoto, updateUserProfile } from "@/features/auth/authSlice";
import {
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useUpdateStudentPhotoMutation,
  useRequestPasswordChangeOTPMutation,
  useChangeStudentPasswordMutation,
} from "../studentApiSlice";
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
import { getProgramByCode } from "@/lib/config";

const StudentProfileSettings = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Debug logging
  console.log("🔍 StudentProfileSettings rendered");
  console.log("🔍 Current user:", user);
  console.log("🔍 User ID:", user?._id);
  console.log("🔍 Has temporary password:", user?.isTemporaryPassword);

  // Form states
  const [profileData, setProfileData] = useState({
    fullname: "",
    phoneNumber: "",
    program: "",
    rollNumber: "",
    batchNumber: "",
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
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetStudentProfileQuery(user?._id);
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateStudentProfileMutation();
  const [updatePhoto, { isLoading: updatingPhoto }] = useUpdateStudentPhotoMutation();
  const [requestPasswordOTP, { isLoading: requestingOTP }] = useRequestPasswordChangeOTPMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangeStudentPasswordMutation();

  // Debug API state
  console.log("Profile API state:", { profile, profileLoading, profileError });

  // Initialize profile data when profile is loaded
  React.useEffect(() => {
    if (profile?.data) {
      setProfileData({
        fullname: profile.data.fullname || "",
        phoneNumber: profile.data.phoneNumber || "",
        program: profile.data.program || "",
        rollNumber: profile.data.rollNumber || "",
        batchNumber: profile.data.batchNumber || "",
      });
    }
  }, [profile]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile({
        id: user._id,
        data: profileData,
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
            phoneNumber: result.data.phoneNumber,
            program: result.data.program,
            rollNumber: result.data.rollNumber,
            batchNumber: result.data.batchNumber
          }));
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error?.data?.message || "Failed to update profile. Please try again.",
      });
    }
  };

  const handlePhotoUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select an image file.",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
      });
      return;
    }

    try {
      const result = await updatePhoto({
        id: user._id,
        photo: file,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Photo Updated!",
          description: "Your profile photo has been updated successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Update the Redux store immediately to update the top-right avatar
        if (result.data?.photo) {
          dispatch(updateUserPhoto({ photo: result.data.photo }));
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error?.data?.message || "Failed to update photo. Please try again.",
      });
    }
  };

  // Step 1: Request OTP for password change
  const handleRequestPasswordOTP = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
      });
      return;
    }

    // Enhanced password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      toast({
        variant: "destructive",
        title: "Password Too Weak",
        description: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).",
      });
      return;
    }

    // For users with temporary password, skip current password validation
    if (user?.isTemporaryPassword) {
      // Skip OTP for temporary password users - go directly to password change
      setOtpData({
        otp: "TEMP_PASSWORD", // Special marker for temporary password users
        showOtpStep: true,
        email: user.email,
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
        toast({
          title: "OTP Sent!",
          description: `OTP has been sent to ${result.data.email}. Please check your email.`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Show OTP input step
        console.log("🔍 Setting OTP step with email:", result.data.email);
        
        setOtpData({
          otp: "",
          showOtpStep: true,
          email: result.data.email,
        });
        
        console.log("🔍 OTP step state updated");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "OTP Request Failed",
        description: error?.data?.message || "Failed to send OTP. Please try again.",
      });
    }
  };

  // Step 2: Change password with OTP
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // For temporary password users, skip OTP validation
    if (user?.isTemporaryPassword && otpData.otp === "TEMP_PASSWORD") {
      try {
        const result = await changePassword({
          id: user._id,
          otp: "TEMP_PASSWORD", // Special marker for temporary password users
          newPassword: passwordData.newPassword,
        }).unwrap();

        if (result.success) {
          toast({
            title: "Password Changed!",
            description: "Your temporary password has been changed successfully. You can now use your new password to login.",
            className: "bg-green-50 border-green-200 text-green-800",
          });
          
          // Reset all password-related state
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
        toast({
          variant: "destructive",
          title: "Password Change Failed",
          description: error?.data?.message || "Failed to change password. Please try again.",
        });
      }
      return;
    }
    
    // Enhanced debug logging for OTP validation (for regular users)
    console.log("🔍 ===== OTP VALIDATION DEBUG =====");
    console.log("🔍 Form submitted - OTP data:", otpData.otp);
    console.log("🔍 OTP type:", typeof otpData.otp);
    console.log("🔍 OTP length:", otpData.otp?.length);
    console.log("🔍 OTP exists check:", !!otpData.otp); 
    console.log("🔍 OTP length check:", otpData.otp?.length === 6);
    console.log("🔍 OTP data length:", otpData.otp?.length);
    console.log("🔍 Full otpData object:", otpData);
    console.log("🔍 ===== OTP VALIDATION DEBUG END =====");
    
    // CRITICAL: Check if OTP is actually valid
    const isOtpValid = otpData.otp && otpData.otp.length === 6;
    console.log("🔍 CRITICAL: isOtpValid =", isOtpValid);
    console.log("🔍 CRITICAL: otpData.otp =", JSON.stringify(otpData.otp));
    
    if (!isOtpValid) {
      console.log("❌ OTP validation failed");
      console.log("❌ Reason: !otpData.otp =", !otpData.otp);
      console.log("❌ Reason: otpData.otp.length !== 6 =", otpData.otp?.length !== 6);
      console.log("❌ CRITICAL: Final validation result =", isOtpValid);
      
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: `Please enter a valid 6-digit OTP. Current OTP: "${otpData.otp}" (length: ${otpData.otp?.length})`,
      });
      return;
    }
    
    console.log("✅ OTP validation passed");

    try {
      console.log("🔍 ===== DETAILED DEBUG BEFORE API CALL =====");
      console.log("🔍 otpData.otp:", otpData.otp);
      console.log("🔍 otpData.otp type:", typeof otpData.otp);
      console.log("🔍 otpData.otp length:", otpData.otp?.length);
      console.log("🔍 otpData.otp === '998841':", otpData.otp === '998841');
      console.log("🔍 passwordData.newPassword:", passwordData.newPassword);
      console.log("🔍 passwordData.newPassword type:", typeof passwordData.newPassword);
      console.log("🔍 passwordData.newPassword length:", passwordData.newPassword?.length);
      console.log("🔍 user._id:", user._id);
      console.log("🔍 user._id type:", typeof user._id);
      console.log("🔍 ===== END DEBUG =====");
      
      const result = await changePassword({
        id: user._id,
        otp: otpData.otp,
        newPassword: passwordData.newPassword,
      }).unwrap();

      console.log('result:', result);
      if (result.success) {
        toast({
          title: "Password Changed!",
          description: "Your password has been changed successfully.",
          className: "bg-green-50 border-green-200 text-green-800",
        });
        
        // Reset all password-related state
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
      toast({
        variant: "destructive",
        title: "Password Change Failed",
        description: error?.data?.message || "Failed to change password. Please try again.",
      });
    }
  };

  // Reset password change flow
  const handleResetPasswordFlow = () => {
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
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.data?.photo} />
              <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
                {getInitials(profile?.data?.fullname || "Student")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.data?.fullname || "Student Name"}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {profile?.data?.rollNumber ? `Roll: ${profile?.data?.rollNumber}` : "Roll: N/A"}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {profile?.data?.batchNumber ? `Batch: ${profile?.data?.batchNumber}` : "Batch: N/A"}
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  {profile?.data?.program ? getProgramByCode(profile?.data?.program) : "Program: N/A"}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {profile?.data?.email || "email@example.com"}
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
            value="photo" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Photo
          </TabsTrigger>
          <TabsTrigger 
            value="password" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4 mr-2" />
            Password
          </TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
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
                      onChange={(e) => setProfileData({ ...profileData, fullname: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input
                      id="rollNumber"
                      type="number"
                      value={profileData.rollNumber}
                      onChange={(e) => setProfileData({ ...profileData, rollNumber: e.target.value })}
                      placeholder="Enter your roll number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batchNumber">Batch Number</Label>
                    <Input
                      id="batchNumber"
                      type="number"
                      value={profileData.batchNumber}
                      onChange={(e) => setProfileData({ ...profileData, batchNumber: e.target.value })}
                      placeholder="Enter your batch number"
                    />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updatingProfile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updatingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
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
                Update your profile picture. Supported formats: JPG, PNG, GIF (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Photo Display */}
                <div className="text-center space-y-4">
                  <Avatar className="h-32 w-32 mx-auto border-4 border-gray-200 shadow-lg">
                    <AvatarImage src={profile?.data?.photo} />
                    <AvatarFallback className="text-4xl font-bold bg-gray-100 text-gray-600">
                      {getInitials(profile?.data?.fullname || "Student")}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-gray-600">
                    Current profile photo
                  </p>
                </div>

                <Separator />

                {/* Photo Upload */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={updatingPhoto}
                      className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    >
                      {updatingPhoto ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Choose New Photo
                        </>
                      )}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpdate}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500">
                    Click to select a new profile photo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {user?.isTemporaryPassword ? "Change Temporary Password" : "Change Password"}
              </CardTitle>
              <CardDescription>
                {user?.isTemporaryPassword ? (
                  otpData.showOtpStep 
                    ? "You're changing your temporary password. Click 'Change Password' to proceed."
                    : "You're currently using a temporary password. Please set a new secure password for your account."
                ) : (
                  otpData.showOtpStep 
                    ? `Enter the OTP sent to ${otpData.email} to complete password change`
                    : "Update your password to keep your account secure. An OTP will be sent to your email for verification."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!otpData.showOtpStep ? (
                // Step 1: Request OTP
                <form onSubmit={handleRequestPasswordOTP} className="space-y-4">
                  {/* Show current password field only for regular users, not temporary password users */}
                  {!user?.isTemporaryPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter your current password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                                      <div className="space-y-2">
                    <p className="text-xs text-gray-500">
                      Password must be at least 8 characters long with uppercase, lowercase, number, and special character
                    </p>
                    
                    {/* Password Strength Indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Strength:</span>
                        <div className="flex gap-1">
                          {[
                            passwordData.newPassword.length >= 8,
                            /[a-z]/.test(passwordData.newPassword),
                            /[A-Z]/.test(passwordData.newPassword),
                            /\d/.test(passwordData.newPassword),
                            /[@$!%*?&]/.test(passwordData.newPassword)
                          ].map((requirement, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                requirement ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {passwordData.newPassword.length > 0 && (
                          <span>
                            {[
                              passwordData.newPassword.length >= 8 && '✓ Length',
                              /[a-z]/.test(passwordData.newPassword) && '✓ Lowercase',
                              /[A-Z]/.test(passwordData.newPassword) && '✓ Uppercase',
                              /\d/.test(passwordData.newPassword) && '✓ Number',
                              /[@$!%*?&]/.test(passwordData.newPassword) && '✓ Special'
                            ].filter(Boolean).join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm your new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
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

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleResetPasswordFlow}
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={requestingOTP}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {requestingOTP ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {user?.isTemporaryPassword ? "Processing..." : "Sending OTP..."}
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          {user?.isTemporaryPassword ? "Continue" : "Send OTP"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                // Step 2: Enter OTP (or confirm for temporary password users)
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {user?.isTemporaryPassword ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">Temporary Password Change</span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        You're changing your temporary password. Click "Change Password" below to set your new secure password.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Shield className="h-5 w-5" />
                        <span className="font-medium">OTP Verification Required</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        We've sent a 6-digit OTP to <strong>{otpData.email}</strong>. 
                        Please check your email and enter the OTP below.
                      </p>
                    </div>
                  )}

                  {/* Show OTP input only for regular users, not temporary password users */}
                  {!user?.isTemporaryPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otpData.otp}
                        onChange={(e) => {
                          // Only allow numbers and ensure OTP is always a string
                          const inputValue = e.target.value;
                          const numericValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                          const otpValue = String(numericValue);
                          
                          console.log("🔍 OTP Input Change:", otpValue);
                          console.log("🔍 OTP Type:", typeof otpValue);
                          console.log("🔍 OTP Length:", otpValue.length);
                          
                          setOtpData({ ...otpData, otp: otpValue });
                        }}
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="text-center text-lg tracking-widest"
                        required
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Enter the 6-digit OTP from your email
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleResetPasswordFlow}
                    >
                      Start Over
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={changingPassword}
                      className={user?.isTemporaryPassword ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {user?.isTemporaryPassword ? "Setting New Password..." : "Changing Password..."}
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          {user?.isTemporaryPassword ? "Set New Password" : "Change Password"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfileSettings;
