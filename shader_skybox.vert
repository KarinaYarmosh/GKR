#version 430 core

layout(location = 0) in vec3 vertexPosition;

uniform mat4 transformation;

out vec3 texCoord;

void main()
{
	texCoord = vertexPosition;
	gl_Position = transformation * vec4(vertexPosition, 1.0);
	//
	//gl_Position = pos.xyww*vec4(1,1,0.99999,1);
}
