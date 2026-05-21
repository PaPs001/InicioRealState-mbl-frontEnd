import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, User } from "./types";

const BASE_URL = 'https://core-api-smoky-ten.vercel.app';

export function validateRegistrationData(data: RegisterRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.push('El correo electrónico es inválido');
    }

    if (!data.phone || data.phone.trim().length < 10) {
        errors.push('El teléfono debe tener al menos 10 dígitos');
    }

    if (!data.password || data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!data.role || !['investor', 'searching', 'tenant', 'agent', 'admin'].includes(data.role)) {
        errors.push('El rol de usuario es inválido');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
    try {
        const validation = validateRegistrationData(data);
        if (!validation.valid) {
            return {
                success: false,
                message: 'Datos de registro inválidos',
                error: validation.errors.join(', ')
            };
        }

        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: data.name.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone.trim(),
                password: data.password,
                role: data.role,
                referralCode: data.referralCode || null
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Error al registrar usuario',
                error: result.error || 'Error desconocido'
            };
        }

        return {
            success: true,
            message: 'Usuario registrado exitosamente',
            user: result.user,
            token: result.token
        };
    } catch (error) {
        console.error('Error en registerUser:', error);
        return {
            success: false,
            message: 'Error de conexión',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
    try {
        if (!data.email || !data.password) {
            return {
                success: false,
                message: 'Email y contraseña son requeridos',
                error: 'Datos incompletos'
            };
        }

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: data.email.trim().toLowerCase(),
                password: data.password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Error al iniciar sesión',
                error: result.error || 'Credenciales inválidas'
            };
        }

        return {
            success: true,
            message: 'Sesión iniciada exitosamente',
            user: result.user,
            token: result.token
        };
    } catch (error) {
        console.error('Error en loginUser:', error);
        return {
            success: false,
            message: 'Error de conexión',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

export async function checkEmailExists(email: string): Promise<boolean> {
    try {
        const response = await fetch(`${BASE_URL}/auth/check-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email.trim().toLowerCase() })
        });

        if (!response.ok) return false;

        const result = await response.json();
        return result.exists || false;
    } catch (error) {
        console.error('Error en checkEmailExists:', error);
        return false;
    }
}

export async function updateUserProfile(
    userId: string,
    updates: Partial<User>,
    token: string
): Promise<{ success: boolean; message: string; user?: User; error?: string }> {
    try {
        const response = await fetch(`${BASE_URL}/auth/profile/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: result.message || 'Error al actualizar perfil',
                error: result.error
            };
        }

        return {
            success: true,
            message: 'Perfil actualizado exitosamente',
            user: result.user
        };
    } catch (error) {
        console.error('Error en updateUserProfile:', error);
        return {
            success: false,
            message: 'Error de conexión',
            error: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}
