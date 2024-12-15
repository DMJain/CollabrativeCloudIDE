import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FaFolder,
  FaFolderOpen,
  FaChevronRight,
  FaChevronDown,
} from 'react-icons/fa';
import { getFileExtension} from '../../../utils/getFileMode';
import { fileIcons } from './fileicon';

const FileTree = ({ tree, onFileSelect}) => {
  return (
    <div className="file-tree text-sm">
      {Object.keys(tree)
        .sort((a, b) => {
          const isAFolder = tree[a] !== null && typeof tree[a] === 'object';
          const isBFolder = tree[b] !== null && typeof tree[b] === 'object';
          return isAFolder === isBFolder ? 0 : isAFolder ? -1 : 1;
        })
        .map((item) => (
          <TreeNode
            key={item}
            name={item}
            node={tree[item]}
            onFileSelect={onFileSelect}
            path={item}
          />
        ))}
    </div>
  );
};

const TreeNode = ({ name, node, onFileSelect, path }) => {
  const isFolder = node && typeof node === 'object';
  const [isOpen, setIsOpen] = useState(false);

  const toggleFolder = () => setIsOpen(!isOpen);

  // Get the file extension and select the corresponding icon
  const fileExtension = !isFolder ? getFileExtension(name) : null;
  const icon = isFolder
    ? isOpen
      ? <FaFolderOpen color="#ffd700" />
      : <FaFolder color="#ffd700" />
    : fileIcons[fileExtension] || fileIcons.default;

  const handleClick = () => {
    if (!isFolder && onFileSelect) {
      onFileSelect(path);
    }
  };

  return (
    <div className="tree-node flex flex-col">
      <div onClick={isFolder ? toggleFolder : handleClick} className="tree-item p-1 hover:bg-gray-200">
        <span className='flex items-center hover:cursor-pointer'>
          {isFolder && (isOpen ? <FaChevronDown /> : <FaChevronRight />)}
          <span style={{ marginLeft: isFolder ? 4 : 0 }}>{icon}</span>
          <span style={{ marginLeft: 8 }}>{name}</span>
        </span>
      </div>
      {isFolder && isOpen && node && (
        <div style={{ paddingLeft: 20 }}>
          {Object.keys(node)
            .sort((a, b) => {
              const isChildAFolder = node[a] && typeof node[a] === 'object';
              const isChildBFolder = node[b] && typeof node[b] === 'object';
              return isChildAFolder === isChildBFolder ? 0 : isChildAFolder ? -1 : 1;
            })
            .map((child) => (
              <TreeNode
                key={child}
                name={child}
                node={node[child]}
                onFileSelect={onFileSelect}
                path={`${path}/${child}`}
              />
            ))}
        </div>
      )}
    </div>
  );
};

TreeNode.propTypes = {
  name: PropTypes.string.isRequired,
  node: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
    PropTypes.oneOf([null]), // Allow null values for node prop
  ]),
  onFileSelect: PropTypes.func,
  path: PropTypes.string.isRequired,
};


FileTree.propTypes = {
  tree: PropTypes.object.isRequired,
  onFileSelect: PropTypes.func.isRequired,
};

export default FileTree;