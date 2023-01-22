#version 430 core

float AMBIENT = 0.1;

uniform vec3 cameraPos;

uniform vec3 color;

uniform vec3 lightPos;
uniform vec3 lightColor;

uniform vec3 spotlightPos;
uniform vec3 spotlightColor;
uniform vec3 spotlightConeDir;
uniform vec3 spotlightPhi;

uniform float exposition;

in vec3 vecNormal;
in vec3 worldPos;

in vec3 viewDirTS;
in vec3 lightDirTS;
in vec3 spotlightDirTS;
in vec3 test;

out vec4 outColor;

//zastapic pbr
vec3 PBR(vec3 lightDir, vec3 lightColor, vec3 normal, vec3 viewDir, vec3 color){
	
	vec3 H =normalize(viewDir + lightDir);
	vec3 R = reflect(-lightDir, normal);  
	float specular = pow(max(dot(viewDir, R), 0.0), 32);

	//float k_s = calculateSpecularComponent(R/specular);
	float PI = 3.14;
	float a = 1.;

	float a2 = a*a;
	float NdotH = max(dot(normal, H), 0.0);
	float NdotH2 = NdotH*NdotH;
	float denom  = (NdotH2 * (a2 - 1.0) + 1.0);

	float D = a2/(PI * denom * denom);

	float k = ((a+1)*(a+1))/8;

	float NdotV   = max(dot(normal, viewDir), 0.0);
    float denom2 = NdotV * (1.0 - k) + k;

	float GeometrySchlickGGX1 = NdotV / denom2;

	float NdotL = max(dot(normal, lightDir), 0.0);

	float GeometrySchlickGGX2 = NdotL / denom2;

	float ggx1 = GeometrySchlickGGX1;
	float ggx2 = GeometrySchlickGGX2;

	float GeometrySmith = ggx1 * ggx2;

	float cosTheta = dot(lightDir, normal);  

	vec3 F0 = vec3(0.04);
	F0  = mix(F0, color, 0.5); //ost metalness

	vec3 fresnelSchlick = F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
	vec3 k_d = 1.0 - fresnelSchlick;

	return ((k_d* (color/PI))+(D * GeometrySmith * fresnelSchlick)/(4*dot(viewDir,normal)*dot(lightDir,normal)))*lightColor*dot(lightDir,normal);
}

vec3 phongLight(vec3 lightDir, vec3 lightColor, vec3 normal,vec3 viewDir){
	float diffuse=max(0,dot(normal,lightDir));

	vec3 R = reflect(-lightDir, normal);  

	float specular = pow(max(dot(viewDir, R), 0.0), 32);

	vec3 resultColor = color*diffuse*lightColor+lightColor*specular;
	return resultColor;
}


void main()
{
	vec3 normal = vec3(0,0,1);
	vec3 viewDir = normalize(viewDirTS);
	vec3 lightDir = normalize(lightPos-worldPos);
	vec3 ambient = AMBIENT*color;
	vec3 attenuatedlightColor = lightColor/pow(length(lightPos-worldPos),2);
	vec3 ilumination;
	//ilumination = ambient+phongLight(normalize(lightDirTS),attenuatedlightColor,normal,viewDir);
	ilumination = ambient + PBR(normalize(lightDirTS),attenuatedlightColor,normal,viewDir, color);
	//flashlight
	vec3 spotlightDir= normalize(spotlightPos-worldPos);
	float angle_atenuation = clamp((dot(-spotlightDir,spotlightConeDir)-0.8)*3,0,1);

	attenuatedlightColor = spotlightColor/pow(length(spotlightPos-worldPos),2)*angle_atenuation;
	ilumination=ilumination+PBR(normalize(spotlightDirTS),attenuatedlightColor,normal,viewDir, color);
	
	outColor = vec4(1.0 - exp(-ilumination*exposition),1);
	//outColor = vec4(test,1);
}
