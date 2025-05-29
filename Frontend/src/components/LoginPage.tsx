/*import * as React from "react";
import { StyleSheet, View, Text, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
//import Group14 from "../assets/group14";

interface Props {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  onLogin: () => void;
  onRegisterNavigate: () => void;
}

const LoginPage: React.FC<Props> = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onRegisterNavigate,
}) => {
  return (
    <SafeAreaView style={styles.loginPage}>
      <View style={[styles.loginPageChild, styles.loginLayout]} />
      <View style={[styles.loginPageItem, styles.loginLayout]} />
      <Text style={[styles.emailAddress, styles.passwordClr]}>Email address</Text>
      <TextInput
        style={[styles.loginPageChild, styles.loginLayout]}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Text style={[styles.password, styles.passwordClr]}>Password</Text>
      <TextInput
        style={[styles.loginPageItem, styles.loginLayout]}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />
      <View style={[styles.loginPageInner, styles.loginPageInnerLayout]} />
      <Pressable
        style={[styles.rectanglePressable, styles.loginPageInnerLayout]}
        onPress={onRegisterNavigate}
      />
      <Pressable style={styles.signIn} onPress={onLogin}>
        <Text style={[styles.signIn1, styles.new1Typo]}>Sign in</Text>
      </Pressable>
      <Text style={[styles.createAccount, styles.passwordClr]}>Create Account</Text>
      <Text style={[styles.signUp, styles.textTypo]} onPress={onRegisterNavigate}>
        Sign up
      </Text>
      <Text style={[styles.new, styles.newPosition]}>
        <Text style={styles.new1Typo}>New?</Text>
        <Text style={styles.textTypo}> </Text>
      </Text>
      <Text style={[styles.bruinnav, styles.passwordClr]}>BruinNav</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginLayout: {
    height: 41,
    width: 286,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    backgroundColor: "#fff",
    left: 53,
    position: "absolute",
  },
  passwordClr: {
    color: "#000",
    textAlign: "left",
    position: "absolute",
  },
  loginPageInnerLayout: {
    height: 47,
    width: 178,
    borderRadius: 30,
    left: 111,
    borderWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    position: "absolute",
  },
  new1Typo: {
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
  textTypo: {
    fontFamily: "Inter-Bold",
    fontWeight: "700",
  },
  newPosition: {
    top: 694,
    textAlign: "left",
    color: "#000",
    fontSize: 20,
    position: "absolute",
  },
  loginPageChild: {
    top: 433,
  },
  loginPageItem: {
    top: 546,
  },
  emailAddress: {
    top: 402,
    textAlign: "left",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: 20,
    left: 53,
    color: "#000",
  },
  password: {
    top: 513,
    textAlign: "left",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: 20,
    left: 53,
    color: "#000",
  },
  loginPageInner: {
    top: 626,
    backgroundColor: "#fff5c8",
  },
  rectanglePressable: {
    top: 738,
    backgroundColor: "#ffdc3d",
  },
  signIn1: {
    color: "#595959",
    textAlign: "left",
    fontSize: 20,
    fontWeight: "500",
  },
  signIn: {
    left: 168,
    top: 638,
    position: "absolute",
  },
  createAccount: {
    top: 750,
    left: 123,
    textAlign: "left",
    fontFamily: "Inter-Medium",
    fontWeight: "500",
    fontSize: 20,
  },
  signUp: {
    left: 190,
    width: 75,
    height: 26,
    top: 694,
    textAlign: "left",
    color: "#000",
    fontSize: 20,
    position: "absolute",
  },
  new: {
    left: 129,
    width: 93,
    height: 10,
  },
  groupIcon: {
    top: 96,
    left: 80,
    position: "absolute",
  },
  bruinnav: {
    top: 314,
    left: 139,
    fontSize: 30,
    fontWeight: "600",
    fontFamily: "Roboto-Bold",
    textAlign: "left",
  },
  loginPage: {
    backgroundColor: "#cbe7ff",
    flex: 1,
    width: "100%",
    height: 852,
    overflow: "hidden",
  },
});

export default LoginPage;*/
import * as React from "react";
import { StyleSheet, View, Text, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  onLogin: () => void;
  onRegisterNavigate: () => void;
}

const LoginPage: React.FC<Props> = ({
  email,
  setEmail,
  password,
  setPassword,
  onLogin,
  onRegisterNavigate,
}) => {
  return (
    <SafeAreaView style={styles.loginPage}>
      <Text style={styles.title}>BruinNav</Text>

      <Text style={styles.label}>Email address</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <Pressable style={styles.loginButton} onPress={onLogin}>
        <Text style={styles.loginText}>Sign in</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New?</Text>
        <Pressable onPress={onRegisterNavigate}>
          <Text style={styles.link}> Sign up</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginPage: {
    flex: 1,
    backgroundColor: "#cbe7ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
  },
  label: {
    alignSelf: "flex-start",
    marginLeft: 8,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  loginButton: {
    width: "60%",
    paddingVertical: 14,
    backgroundColor: "#ffdc3d",
    borderRadius: 30,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#595959",
  },
  footer: {
    flexDirection: "row",
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "600",
  },
});

export default LoginPage;
