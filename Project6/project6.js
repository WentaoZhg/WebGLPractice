var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model
		Light light = lights[i];
		
		HitInfo hit;
        Ray shadow_ray;
            shadow_ray.pos = position;
            shadow_ray.dir = normalize(light.position - position);
            
        
        if (!IntersectRay(hit, shadow_ray)) {
            vec3 omega = normalize(light.position - position);
            vec3 diffuse = mtl.k_d * max(dot(omega, normalize(normal)), 0.0);
            
            vec3 h = normalize(view + omega);
            float cos_phi = clamp(dot(h, normal), 0.0, 1.0);
            vec3 specular = mtl.k_s * pow(cos_phi, mtl.n);
            color += light.intensity * (diffuse + specular);
            
        }
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		// TO-DO: If intersection is found, update the given HitInfo
		
		Sphere sphere = spheres[i];
        vec3 d = normalize(ray.dir);
        vec3 p = ray.pos;
        vec3 center = sphere.center;

        float r = sphere.radius;
        float b = dot((2.0 * d), (p - center));
        float c = dot((p - center), (p - center)) - pow(r, 2.0);
        float delta = b*b - 4.0 * c;

        if(delta > 0.0) {
           delta = sqrt(delta);
           float t = (-b - delta) / (2.0);

           if (t < hit.t && t > 0.0001) {
             hit.t = t;
             hit.position = p + t * d;

             hit.normal = (hit.position - center) / r;
             hit.mtl = sphere.mtl;

             foundHit = true;
           }
        }
		
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.pos = hit.position;
			r.dir = normalize(reflect(-view, hit.normal));
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				// TO-DO: Update the loop variables for tracing the next reflection ray
				view = normalize(-r.dir);
				clr += k_s * Shade(h.mtl, h.position, h.normal, view);
                k_s *= h.mtl.k_s;
                hit = h;
				
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;