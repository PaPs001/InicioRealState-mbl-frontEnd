import { View, Text, Pressable, Image } from "react-native";

export const ProfileModal () => {
  return(
    <Text style={{ color: '#12382f', fontSize: 20, fontWeight: '700' }}>{title}</Text>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: 150, height: 150, borderRadius: 75, alignSelf: 'center' }} />
          ) : (
            <Text style={{ color: '#6b6b6b' }}>Escoge una imagen de tu galeria.</Text>
          )}
          {error ? <Text style={{ color: '#b42318' }}>{error}</Text> : null}
          <Pressable
            disabled={isSaving}
            onPress={addImage}
            style={{ borderRadius: 10, borderWidth: 1, borderColor: '#315b41', padding: 12, alignItems: 'center' }}
          >
            <Text style={{ color: '#315b41', fontWeight: '700' }}>{imageUri ? 'Cambiar imagen' : 'Escoger imagen'}</Text>
          </Pressable>
          {imageUri ? (
            <Pressable
              disabled={isSaving}
              onPress={onSave}
              style={{ borderRadius: 10, backgroundColor: '#315b41', padding: 12, alignItems: 'center', opacity: isSaving ? 0.6 : 1 }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>{isSaving ? 'Guardando...' : 'Guardar foto'}</Text>
            </Pressable>
          ) : null}
          <Pressable disabled={isSaving} onPress={onClose} style={{ padding: 8, alignItems: 'center' }}>
            <Text style={{ color: '#6b6b6b' }}>Cancelar</Text>
          </Pressable>
  )
}
