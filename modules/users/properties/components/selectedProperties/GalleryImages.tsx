import {
    View,
    Text,
    Image,
    Pressable
} from 'react-native'
import { styles } from './styles/GalleryImages.styles'
import { Blocks, ReceiptRussianRuble } from 'lucide-react-native'
import {FlashList} from '@shopify/flash-list'
import { icons } from '@/assets'
type GalleryProps = {
    images: string[],
    onClose: () => void,
    onShare: () => void,
    onFavorite: () => void
}

type GalleryPattern = 'twoColumns' | 'threeColumns' | 'fourBlocks' | "fourBlocksInverted"

type GalleryBlock = {
    pattern: GalleryPattern
    images: string[]
}

const galleryPatterns = [
  {
    type: 'threeColumns',
    count: 3,
  },
  {
    type: 'twoColumns',
    count: 2,
  },
  {
    type: 'fourBlocks',
    count: 4
  },
  {
    type: 'fourBlocksInverted',
    count: 4
  }
] as const  

const createImageBlock = (images: string[]): GalleryBlock[] => {
    const blocks: GalleryBlock[] = []

    let imageIndex = 0
    let patternIndex = 0

    while(imageIndex < images.length){
        const pattern = galleryPatterns[
            patternIndex % galleryPatterns.length
        ]
        
        const blockImages = images.slice(
            imageIndex, imageIndex + pattern.count
        )

        blocks.push({
            pattern: pattern.type,
            images: blockImages
        })

        imageIndex += pattern.count 
        patternIndex++
    }

    return blocks
}
export const GalleryImages = ({
    images,
    onClose,
    onShare,
    onFavorite,
}: GalleryProps) => {
    const [mainImage, ...galleryImages] = images
    const imageBlocks = createImageBlock(galleryImages)

    return(
        <View style={styles.container}>
            <FlashList
                data={imageBlocks}
                ListHeaderComponent={
                    mainImage ? (
                        <Image
                            source={{ uri: mainImage }}
                            style={styles.mainImage}
                            resizeMode='cover'
                        />
                    ): null
                }
                renderItem={({ item }) => (
                    <GalleryBlock
                        images={item.images}
                        pattern={item.pattern}
                    />
                )}
                keyExtractor={(_, index) => index.toString()}
            />
            <Pressable 
                onPress={onClose}
                style={[styles.buttonOverImage, styles.backButton]}
            >
                <icons.ArrowRight/>
            </Pressable>
            <View style={styles.leftButtonsContainer}>
                <Pressable onPress={onShare} style={styles.buttonOverImage}>
                    <icons.Send width={25} height={25}/>
                </Pressable>
                <Pressable onPress={onFavorite} style={styles.buttonOverImage}>
                    <icons.Heart width={25} height={25}/>
                </Pressable>
            </View>
        </View>
    )
}

type GalleryBlockProps = {
    images: string[],
    pattern: GalleryPattern
}

const GalleryBlock = ({
    images,
    pattern
}: GalleryBlockProps) => {
    const [topLeftImage, topRightImage, bottomLeftImage, bottomRightImage] = images

    switch(pattern){
        case 'threeColumns':
            return(
                <View style={styles.threeColumns}>
                    {images.map((image, index) => (
                        <Image 
                            key={`${image}-${index}`}
                            source={{ uri:image}}
                            style={styles.threeColumnImage}    
                        />
                    ))}
                </View>
            )
        case 'twoColumns':
            return(
                <View style={styles.twoColumns}>
                    {images.map((image, index) => (
                        <Image 
                            key={`${image}-${index}`}
                            source={{ uri:image}}
                            style={styles.twoColumnImage}
                        />
                    ))}
                </View>
            )
        case 'fourBlocks':
            return(
                <View style={styles.fourColumn}>
                    <View style={styles.leftColumn}>
                        <Image source={{uri: topLeftImage}} style={styles.topLeftImage}/>
                        <Image source={{uri: bottomLeftImage}} style={styles.bottomLeftImage}/>
                    </View>
                    <View style={styles.rightColumn}>
                        <Image source={{uri: topLeftImage}} style={styles.topLeftImage}/>
                        <Image source={{uri: bottomRightImage}} style={styles.bottomRightImage}/>
                    </View>
                </View>
            )
        case 'fourBlocksInverted':
            return(
                <View style={styles.fourColumn}>
                    <View style={styles.rightColumn}>
                        <Image source={{uri: topRightImage}} style={styles.topRightImage}/>
                        <Image source={{uri: bottomRightImage}} style={styles.bottomRightImage}/>
                    </View>
                    <View style={styles.leftColumn}>
                        <Image source={{uri: topLeftImage}} style={styles.topLeftImage}/>
                        <Image source={{uri: bottomLeftImage}} style={styles.bottomLeftImage}/>
                    </View>
                </View>
            )
        
    }
}
