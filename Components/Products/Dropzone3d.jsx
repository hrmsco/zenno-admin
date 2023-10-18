// ** Next, React And Locals Imports
import { useEffect, useState } from "react";
import Link from "next/link";
import ToastStatus from "@/Components/Toaster/ToastStatus";
import PrimaryButton from "@/Components/Button/PrimaryButton";
import CustomImage from "@/Components/Image/CustomImage";
import theme from "@/mui/theme.js";
import useStyles from "./styles.js";

// ** MUI Imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

// ** Third Party Imports
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { MdClose } from "react-icons/md";

function Dropzone3d(props) {
  const { classes } = useStyles();

  // States
  const [prevImages, setPrevImages] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, .glb, .gltf", // Allow images, .glb, and .gltf files
    maxFiles: 6,
    maxSize: 1000000,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles?.length > 0 && prevImages.length < 6) {
        const imageFiles = acceptedFiles.map((file) => Object.assign(file));
        setPrevImages((prevValue) => [...prevValue, ...imageFiles]);

        // To store images in server
        let image = new FormData();

        for (let i = 0; i < acceptedFiles.length; i++) {
          console.log("boucle");
          const file = acceptedFiles[i];
          console.log("file", file);
          const isImage = file.type.startsWith("image/");
          const is3DModel =
            file.name.toLowerCase().endsWith(".glb") ||
            file.name.toLowerCase().endsWith(".gltf");
          console.log("avant if");
          if (isImage) {
            console.log("image");
            image.append("<PRODUCT_IMAGES>", file);
            const { data } = await axios.post(
              process.env.NEXT_PUBLIC_API_URL + "product-images",
              image
            );

            const path = [...props.value];

            data?.paths.map((item) => path.push(item.split("/")[3]));

            if (props.onChange) {
              props.onChange(path);
            }
          } else if (is3DModel) {
            image.append("<PRODUCT_MODELS>", file);
            let response; // Définissez une variable pour stocker la réponse de la requête

            if (file.name.toLowerCase().endsWith(".glb")) {
              response = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + "product-models-glb",
                image
              );
            } else {
              response = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + "product-models-gltf",
                image
              );
            }

            if (response.data) {
              // Vérifiez si la propriété `data` de la réponse est définie
              const path = [...props.value];

              response.data.paths.map((item) => path.push(item.split("/")[3]));

              if (props.onChange) {
                props.onChange(path);
              }
            } else {
              ToastStatus(
                "Erreur",
                "Une erreur s'est produite lors du téléchargement du modèle 3D."
              );
            }
          } else {
            ToastStatus(
              "Erreur",
              "Type de fichier invalide. Vous pouvez uniquement télécharger des images, des fichiers .glb ou .gltf."
            );
          }
        }
      } else {
        ToastStatus(
          "Error",
          "You can only upload 6 files & maximum size of 1 MB."
        );
      }
    },
    onDropRejected: () => {
      ToastStatus(
        "Error",
        "You can only upload 6 files & maximum size of 1 MB."
      );
    },
  });

  useEffect(() => {
    const images = props.value;

    // Convert to blob image
    if (images.length > 0 && prevImages.length === 0) {
      const allImages = [];

      Promise.all(
        images.map((image) =>
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}product/${image}`)
            .then((res) => res.blob())
            .then((blob) => {
              allImages.push(blob);
            })
            .catch((error) => {
              // Handle error if the fetch operation fails
              console.error(error);
            })
        )
      )
        .then(() => {
          setPrevImages(allImages);
        })
        .catch((error) => {
          // Handle error if any of the fetch requests fail
          console.error(error);
        });
    }
  }, [props.value]);
  // Render the preview image
  const renderImages = (file) => {
    console.log("file", file);
    return (
      <>
        <CustomImage
          alt={"product"}
          {...(file.path?.toLowerCase().endsWith(".glb") ||
          file.path?.toLowerCase().endsWith(".gltf") || file.type === "model/gltf+json" ||
          file.type === "model/gltf-binary"
            ? {
                src: "/assets/thumb-3d.jpg",
              }
            : {
                src: URL.createObjectURL(new Blob([file])),
              })}
          width={80}
          height={100}
        />
      </>
    );
  };

  const handleRemoveFile = (file, index) => {
    const filtered = prevImages.filter((item) => item !== file);

    if (prevImages.length > 0) {
      setPrevImages(filtered);
    }

    // Removing image from db
    const removeImageIndex = props.value[index];

    const filteredImages = props.value.filter(
      (item) => item !== removeImageIndex
    );

    props.onChange(filteredImages);
  };

  const handleRemoveAllFiles = () => {
    setPrevImages([]);
    // Removing images from db
    props.onChange([]);
  };

  // Preview images
  const fileList = prevImages.map((file, index) => (
    <ListItem sx={{ p: 0 }} key={index} className={classes.previewImg}>
      <div className={classes.removeImg}>
        <div>{renderImages(file)}</div>
      </div>
      <MdClose
        onClick={() => handleRemoveFile(file, index)}
        className={classes.removeImgIcon}
      />
    </ListItem>
  ));

  const handleLinkClick = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <Box {...getRootProps()} className={classes.dropZone}>
        <input {...getInputProps()} />
        <Box className={classes.uploadContainer}>
          <CustomImage
            src={"/assets/uploadIcon.png"}
            alt="upload icon"
            width={100}
            height={100}
          />
          <Box>
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              Drop files here or click{" "}
              <Link href="/" onClick={handleLinkClick}>
                browse
              </Link>{" "}
              thorough your machine
            </Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ mt: 1 }} variant="body1" align="center">
        {props.text}
      </Typography>
      {prevImages?.length > 0 && (
        <div className={classes.previewImgContainer}>
          <List className={classes.previewImgs}>{fileList}</List>
          <div className={classes.removeAllBtn}>
            <PrimaryButton
              text="Remove All"
              onClick={handleRemoveAllFiles}
              style={{
                backgroundColor: `${theme.palette.error.light} !important`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropzone3d;
