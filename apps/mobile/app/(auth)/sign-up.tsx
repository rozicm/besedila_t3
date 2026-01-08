import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView, StyleSheet } from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Colors, BorderRadius, Spacing, FontSizes } from '../../constants/theme';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // OAuth hooks
  const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const handleSignUp = useCallback(async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) { Alert.alert('Error', 'Please fill in all required fields'); return; }

    setLoading(true);
    try {
      await signUp.create({ firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.errors?.[0]?.message || 'Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, firstName, lastName, email, password, signUp]);

  const handleVerify = useCallback(async () => {
    if (!isLoaded) return;
    if (!verificationCode.trim()) { Alert.alert('Error', 'Please enter the verification code'); return; }

    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: verificationCode });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/(app)');
      } else {
        Alert.alert('Error', 'Verification could not be completed.');
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.errors?.[0]?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, verificationCode, signUp, setActive, router]);

  const handleGoogleSignUp = useCallback(async () => {
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startGoogleOAuth({
        redirectUrl: Linking.createURL('/(app)', { scheme: 'band-manager' }),
      });
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(app)');
      }
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      Alert.alert('Error', 'Google sign up failed. Please try again.');
    }
  }, [startGoogleOAuth, router]);

  const handleAppleSignUp = useCallback(async () => {
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startAppleOAuth({
        redirectUrl: Linking.createURL('/(app)', { scheme: 'band-manager' }),
      });
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(app)');
      }
    } catch (err: any) {
      console.error('Apple OAuth error:', err);
      Alert.alert('Error', 'Apple sign up failed. Please try again.');
    }
  }, [startAppleOAuth, router]);

  // Verification Screen
  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.content}>
            <View style={styles.logoSection}>
              <View style={[styles.logoBox, { backgroundColor: Colors.green }]}>
                <Ionicons name="mail" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Verify Email</Text>
              <Text style={[styles.subtitle, { textAlign: 'center' }]}>We sent a code to {email}</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="key-outline" size={20} color={Colors.mutedForeground} style={{ marginRight: 10 }} />
                  <TextInput value={verificationCode} onChangeText={setVerificationCode} placeholder="Enter 6-digit code" placeholderTextColor={Colors.mutedForeground} keyboardType="number-pad" maxLength={6} style={[styles.input, { textAlign: 'center', letterSpacing: 4 }]} />
                </View>
              </View>
              <TouchableOpacity onPress={handleVerify} disabled={loading} style={[styles.signInButton, loading && { opacity: 0.7 }]}>
                {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signInButtonText}>Verify</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPendingVerification(false)} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign Up Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Ionicons name="musical-notes" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Band Manager today</Text>
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthSection}>
            <TouchableOpacity onPress={handleGoogleSignUp} style={styles.oauthButton} activeOpacity={0.7}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.oauthButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity onPress={handleAppleSignUp} style={[styles.oauthButton, styles.appleButton]} activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
                <Text style={[styles.oauthButtonText, { color: '#FFFFFF' }]}>Continue with Apple</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>First Name</Text>
                <TextInput value={firstName} onChangeText={setFirstName} placeholder="John" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput value={lastName} onChangeText={setLastName} placeholder="Doe" placeholderTextColor={Colors.mutedForeground} style={styles.textInput} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color={Colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={Colors.mutedForeground} keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={styles.input} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.mutedForeground} style={{ marginRight: 10 }} />
                <TextInput value={password} onChangeText={setPassword} placeholder="Min. 8 characters" placeholderTextColor={Colors.mutedForeground} secureTextEntry={!showPassword} autoCapitalize="none" style={styles.input} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={handleSignUp} disabled={loading || !isLoaded} style={[styles.signInButton, loading && { opacity: 0.7 }]}>
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.signInButtonText}>Create Account</Text>}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity><Text style={styles.linkText}>Sign In</Text></TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 80, height: 80, backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.foreground },
  subtitle: { fontSize: FontSizes.lg, color: Colors.mutedForeground, marginTop: 8 },
  oauthSection: { gap: 12, marginBottom: 24 },
  oauthButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingVertical: 14, gap: 12 },
  appleButton: { backgroundColor: '#000000', borderColor: '#000000' },
  googleIcon: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#4285F4', alignItems: 'center', justifyContent: 'center' },
  googleIconText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  oauthButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.foreground },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { paddingHorizontal: 16, fontSize: FontSizes.sm, color: Colors.mutedForeground },
  form: { gap: 16 },
  nameRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 6 },
  label: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.foreground },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 14, fontSize: FontSizes.lg, color: Colors.foreground },
  textInput: { backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.lg, paddingHorizontal: 16, paddingVertical: 14, fontSize: FontSizes.lg, color: Colors.foreground },
  signInButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  signInButtonText: { fontSize: FontSizes.lg, fontWeight: '600', color: '#FFFFFF' },
  backButton: { alignItems: 'center', paddingVertical: 12 },
  backButtonText: { color: Colors.mutedForeground },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: Colors.mutedForeground },
  linkText: { color: Colors.primary, fontWeight: '600' },
});
