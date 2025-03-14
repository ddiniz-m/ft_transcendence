function handleOAuthRedirect() {
	const { code, accessToken, refreshToken, auth, otp_secret, username, error } =
		getUrlParams();

	if (error) {
		alert(error);
		seturl("/login");
	}

	if (accessToken && refreshToken) {
		processLogin(accessToken, refreshToken, auth, otp_secret, username);
	}
}

async function processLogin(accessToken, refreshToken, auth, otp_secret, username) {
	if (accessToken && refreshToken) {
		if (auth === "True" || auth === true) {
			const otpModal = new bootstrap.Modal(
				document.getElementById("otp-modal"),
				{
					backdrop: "static",
					keyboard: false,
				}
			);
			otpModal.show();

			document.getElementById("otp-submit").onclick = async function () {
				const otp = document.getElementById("otp-input").value;

				try {
					const otpData = await myFetch(
						`https://${MAIN_HOST}:8443/user_auth/verify_otp/`,
						{
							otp: otp,
							otp_secret: otp_secret,
							username: username,
						},
						"POST",
						false
					);

					if (otpData.status === "success") {
						localStorage.setItem("access_token", accessToken);
						localStorage.setItem("refresh_token", refreshToken);
						localStorage.setItem("is_2fa_enabled", "true");
						otpModal.hide();
						if (window.location.href.includes("code"))
							window.location.href = `https://${MAIN_HOST}:8443/#/home`;
						else
							seturl("/home");
					}
				} catch (otpError) {
					showErrorModal("Invalid OTP. Please try again.");
				}
			};
		} else {
			localStorage.setItem("access_token", accessToken);
			localStorage.setItem("refresh_token", refreshToken);
			if (window.location.href.includes("code")) {
				// console.log("codeeeee");
				window.location.href = `https://${MAIN_HOST}:8443/#/home`;
			} else {
				seturl("/home");
			}
		}
	} else {
		showErrorModal("Login failed. OAuth parameters missing.");
	}
}

document.getElementById("form-login").addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(event.target);

		try {
			const data = await myFetch(
				`https://${MAIN_HOST}:8443/user_auth/login/`,
				formData,
				"POST",
				false
			);
			console.log("Login successful ", data);
		processLogin(data.access, data.refresh, data.is_2fa_enabled, data.otp_secret, data.username);
		} catch (error) {
			console.log("login.js: ", error);
			const messages = Object.values(error);
			console.log("Login Failed. Reasons: ", messages);
			showErrorModal(messages);
		}
	});

document.getElementById("intra-login").addEventListener("click", function () {
	const { code, accessToken, refreshToken } = getUrlParams();

	if (!code && !accessToken && !refreshToken) {
		const redirectUri = `https://${MAIN_HOST}:8443/user_auth/login/`;
		const responseType = "code";

		const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=${responseType}`;
		window.location.href = authUrl;
	}
});

window.addEventListener("popstate", handleOAuthRedirect);
handleOAuthRedirect();
