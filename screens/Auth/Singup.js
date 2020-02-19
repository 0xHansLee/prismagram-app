import React, { useState } from "react";
import styled from "styled-components";
import { Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import * as Facebook from "expo-facebook";
import * as Google from "expo-google-app-auth";
import AuthButton from "../../components/AuthButton";
import AuthInput from "../../components/AuthInput";
import useInput from "../../hooks/useInput";
import { useMutation } from "react-apollo-hooks";
import { LOG_IN, CREATE_ACCOUNT } from "./AuthQueries";

const View = styled.View`
  justify-content: center;
  align-items: center;
  flex: 1;
`;

const Text = styled.Text``;

const FBContainer = styled.View`
  margin-top: 25px;
  padding-top: 25px;
  border-top-width: 1px;
  border-color: ${props => props.theme.lightGreyColor};
  border-style: solid;
`;

export default ({ navigation }) => {
  const emailInput = useInput(navigation.getParam("email", ""));
  const usernameInput = useInput("");
  const fNameInput = useInput("");
  const lNameInput = useInput("");
  const [loading, setLoading] = useState(false);
  const [createAccountMutation] = useMutation(CREATE_ACCOUNT, {
    variables: {
      email: emailInput.value,
      username: usernameInput.value,
      firstName: fNameInput.value,
      lastName: lNameInput.value
    }
  });

  const handleSignup = async () => {
    const { value: email } = emailInput;
    const { value: username } = usernameInput;
    const { value: fName } = fNameInput;
    const { value: lName } = lNameInput;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
      return Alert.alert("That email is invalid");
    }
    if (username === "") {
      return Alert.alert("Invalid username");
    }
    if (fName === "") {
      return Alert.alert("Please write your first name");
    }
    if (lName === "") {
      return Alert.alert("Please write your last name");
    }
    try {
      setLoading(true);
      const {
        data: { createAccount }
      } = await createAccountMutation();
      if (createAccount) {
        Alert.alert("Account created", "Log in now");
        navigation.navigate("Login", { email });
      }
    } catch (e) {
      Alert.alert("Username or Email already taken", "Log in instead");
      navigation.navigate("Login", { email });
    } finally {
      setLoading(false);
    }
  };

  const fbLogin = async () => {
    try {
      setLoading(true);
      await Facebook.initializeAsync("1389367784581169");
      const { type, token } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ["public_profile", "email"]
      });
      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?access_token=${token}&fields=id,first_name,last_name,email`
        );
        const { email, first_name, last_name } = response.json();
        updateFormData(email, first_name, last_name);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Facebook Login Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    const GOOGLE_ID =
      "113141857916-1cumlanh1aofht7sl9gsthngjr634ad0.apps.googleusercontent.com";
    try {
      setLoading(true);
      const result = await Google.logInAsync({
        androidClientId: GOOGLE_ID,
        scopes: ["profile", "email"]
      });
      if (result.type === "success") {
        const user = await fetch("https://www.googleapis.com/userinfo/v2/me", {
          headers: { Authorization: `Bearer ${result.accessToken}` }
        });
        const { email, family_name, given_name } = await user.json();
        updateFormData(email, given_name, family_name);
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      console.log(2);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (email, firstName, lastName) => {
    emailInput.setValue(email);
    fNameInput.setValue(firstName);
    lNameInput.setValue(lastName);
    const [username] = email.split("@");
    usernameInput.setValue(username);
  };

  return (
    // TouchableWithoutFeedback with keyboard dismiss => When click outside, dismiss keyboard
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View>
        <AuthInput
          {...emailInput}
          placeholder={"Email"}
          keyboardType={"email-address"}
          returnKeyType="send"
          autoCorrect={false}
        />
        <AuthInput
          {...usernameInput}
          placeholder={"Username"}
          returnKeyType="send"
          autoCorrect={false}
        />
        <AuthInput
          {...fNameInput}
          placeholder={"First name"}
          autoCapitalize={"words"}
        />
        <AuthInput
          {...lNameInput}
          placeholder={"Last name"}
          autoCapitalize={"words"}
        />
        <AuthButton text="Sign up" onPress={handleSignup} loading={loading} />
        <FBContainer>
          <AuthButton
            bgColor={"#2D4DA7"}
            text="Connect Facebook"
            onPress={fbLogin}
            loading={loading}
          />

          <AuthButton
            bgColor={"#EE1922"}
            text="Connect Google"
            onPress={googleLogin}
            loading={loading}
          />
        </FBContainer>
      </View>
    </TouchableWithoutFeedback>
  );
};
